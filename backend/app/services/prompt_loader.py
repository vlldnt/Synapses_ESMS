import json
from pathlib import Path
from sqlalchemy import text


def load_initial_prompts(db, Prompt):
    prompt_file = Path(__file__).resolve().parents[2] / 'data' / 'prompts.json'
    if not prompt_file.exists():
        return

    if db.engine.dialect.name == 'postgresql':
        try:
            with db.engine.connect() as conn:
                conn.execute(text('ALTER TABLE prompt ALTER COLUMN content TYPE TEXT'))
                conn.execute(text('ALTER TABLE prompt ALTER COLUMN context TYPE TEXT'))
        except Exception:
            pass

    with prompt_file.open('r', encoding='utf-8') as f:
        prompts = json.load(f)

    for prompt_data in prompts:
        if not Prompt.query.filter_by(name=prompt_data.get('name')).first():
            prompt = Prompt(
                name=prompt_data.get('name'),
                type=prompt_data.get('type'),
                context=prompt_data.get('context', ''),
                content=prompt_data.get('content', '')
            )
            db.session.add(prompt)
    db.session.commit()

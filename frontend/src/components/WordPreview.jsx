import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function parseRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

function isSeparatorRow(line) {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function parseMarkdownTable(tableLines) {
  if (tableLines.length < 2) return null;
  const headers = parseRow(tableLines[0]);
  if (!isSeparatorRow(tableLines[1])) return null;
  const rows = tableLines.slice(2).map(parseRow);
  return { headers, rows };
}

// Découpe le texte en blocs : { type: 'text' | 'table', content }
function splitBlocks(text) {
  const lines = (text || '').split('\n');
  const blocks = [];
  let textBuf = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (textBuf.length) {
        blocks.push({ type: 'text', content: textBuf.join('\n') });
        textBuf = [];
      }
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const parsed = parseMarkdownTable(tableLines);
      if (parsed) {
        blocks.push({ type: 'table', ...parsed });
      } else {
        blocks.push({ type: 'text', content: tableLines.join('\n') });
      }
    } else {
      textBuf.push(lines[i]);
      i++;
    }
  }

  if (textBuf.length) blocks.push({ type: 'text', content: textBuf.join('\n') });
  return blocks;
}

function TableBlock({ headers, rows }) {
  return (
    <div className="-mx-8 md:-mx-12 my-6 overflow-x-auto border-y border-[#bdd4f0]">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="bg-[#1e4fa8]">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-[12px] font-semibold text-white tracking-wide whitespace-nowrap border-r border-[#2d5cbf] last:border-r-0 first:pl-8 md:first:pl-12 last:pr-8 md:last:pr-12"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#dce8f7]">
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? 'bg-[#f4f8ff]' : 'bg-white'}>
              {headers.map((_, ci) => (
                <td
                  key={ci}
                  className="px-4 py-2.5 text-[13px] text-[#374151] align-top leading-snug border-r border-[#dce8f7] last:border-r-0 first:pl-8 md:first:pl-12 last:pr-8 md:last:pr-12"
                >
                  {row[ci] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WordPreview({ text }) {
  const blocks = splitBlocks(text);

  return (
    <div className="bg-white text-[#1a1a1a] font-['Calibri','Georgia',serif] text-[15px] leading-7 rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.10)] border border-[#e0e0e0] min-h-32 overflow-hidden">
      <div className="px-8 md:px-12 py-8 md:py-10">
        {blocks.map((block, idx) =>
          block.type === 'table' ? (
            <TableBlock key={idx} headers={block.headers} rows={block.rows} />
          ) : (
            <ReactMarkdown
              key={idx}
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-[18px] font-bold text-[#0D66D4] mt-6 mb-2 border-b-2 border-[#0D66D4] pb-1">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-[16px] font-bold text-[#1a1a1a] mt-5 mb-1.5">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-[15px] font-semibold text-[#374151] mt-4 mb-1">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="my-1.5 text-[15px] leading-7">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="my-1.5 pl-6 list-disc space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-1.5 pl-6 list-decimal space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-[15px] leading-7">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-[#1a1a1a]">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-[#555]">{children}</em>
                ),
                hr: () => (
                  <hr className="my-5 border-t-2 border-[#0D66D4] opacity-40" />
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#0D66D4] pl-4 italic text-[#555] my-3 bg-[#f0f7ff] py-2 pr-3 rounded-r-md">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {block.content}
            </ReactMarkdown>
          ),
        )}
      </div>
    </div>
  );
}

### Synapses EMS - Web App - Backend

## Installing Dependencies

To install all the required libraries in your virtual environment, use the `requirements.txt` file:

```bash 
pip install -r requirements.txt
```

## Configure Test PostgreSQL Database

To set up the test PostgreSQL database, open `config.py` and update the following parameters:

```bash
    DB_USER = os.getenv('DB_USER', '{username}')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '{password}')
    DB_HOST = os.getenv('DB_HOST', '{host}')
    DB_PORT = os.getenv('DB_PORT', '{port}')
    DB_NAME = os.getenv('DB_NAME', '{database name}')
```
__Note__: Replace the placeholders inside **' '** with your actual database credentials.

## Token Test with Flask-RESTX

To authorize your requests, go to the **Authorization** field (top-right) and enter your token in this format:
``` Bearer <your_token_here> ```

Make sure to replace `<your_token_here>` with the actual JWT token you received after login.
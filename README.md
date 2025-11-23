# Deployed app here:  https://fithubbooking-cps-714-section3.vercel.app/

# How to set up frontend:

1. Install Node.js if you haven't already from https://nodejs.org/en/download
2. cd to the frontend folder
3. Run the command `npm i` to install node_modules
4. Run the command `npm run dev` to start the frontend

# How to set up backend:

1. Ensure that you have Python 3.10+ installed (Windows users can get it from https://www.python.org/downloads/, macOS users can use the same site or run `brew install python@3`)
2. cd to the backend folder
3. Create a virtual environment (Windows: run `py -m venv .venv`; macOS/Linux: run `python3 -m venv .venv`)
4. Activate the virtual environment (Windows CMD: `.venv\Scripts\activate.bat`; macOS/Linux: `source .venv/bin/activate`)
5. In the backend folder, create a ".env" file that sets `SUPABASE_URL` and `SUPABASE_KEY`, you can create a copy of the .env template.
6. Run `pip install -r requirements.txt` (use "pip3" on macOS if needed)
6. Run `fastapi dev main.py` to start the backend

# How to run tests:

1. cd to the `backend` folder
2. Activate the virtual environment if not already active:
   - Windows CMD: `.venv\Scripts\activate.bat`
   - macOS/Linux: `source .venv/bin/activate`
3. Install test dependencies if not done already:
   - Run `pip install -r requirements.txt`
4. Make sure `.env` in `backend` contains valid `SUPABASE_URL` and `SUPABASE_KEY`
   if you plan to run integration tests against the live database.
5. To run **all tests** (unit + integration):
   - `pytest`
6. To run **only fast unit tests** (mocked Supabase):
   - `pytest -m unit`
7. To run **only integration tests** (live Supabase):
   - `pytest -m integration`

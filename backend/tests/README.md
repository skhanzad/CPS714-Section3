## Booking FastAPI test suite

This folder contains the automated tests for the backend booking API.

- **Unit tests** use **mocked Supabase** so that no real database calls happen.
- **Integration tests** talk to your **live Supabase** instance using the
  credentials from the `.env` file in the `backend` folder.

### Files

- `test_booking_unit.py`: High‑level **unit tests** that exercise the main
  booking and member‑related endpoints exposed by `main.py` using mocked
  Supabase.
- `test_integration.py`: **Integration tests** that call the real Supabase
  database (class schedules, bookings, members). These require a valid
  `.env` in the `backend` folder with `SUPABASE_URL` and `SUPABASE_KEY`
  pointing at a live project.
- `conftest.py`: Shared `pytest` fixtures used by the tests in this
  folder (for example `client`, `basic_member_data`, `basic_class_schedule`).

### Key concepts

- **Pytest fixtures**  
  Fixtures are reusable setup functions that you can inject into a test
  by adding their name as a parameter (for example `client`, `mocker`,
  `basic_member_data`). They help keep tests small and focused.

- **FastAPI `TestClient`**  
  The `client` fixture in `conftest.py` wraps the FastAPI app so tests can
  call endpoints like `client.get("/classes/schedules")` or
  `client.post("/classes/book", json=...)` without starting a real HTTP
  server.

- **Mocked Supabase (unit tests)**  
  The unit tests never hit a real Supabase instance. Instead, they use the
  `mocker` fixture (from `pytest-mock`) plus helper functions like
  `make_chainable_query` to create fake Supabase query objects and patch
  `main.supabase`. This allows you to simulate:

  - successful responses (e.g., schedules or members found)
  - error conditions (e.g., schedule not found, class full, member not found)
  - edge cases (e.g., duplicate bookings, insufficient membership tier)

- **Live Supabase (integration tests)**  
  The integration tests in `test_integration.py` **do not mock** Supabase.
  They hit the real database configured by `SUPABASE_URL` and `SUPABASE_KEY`
  in `.env`. These tests verify that:

  - your API can connect to Supabase from the running FastAPI app
  - the schema / tables (`class_schedules`, `class_bookings`, `member`) behave
    as expected

- **Test markers and how to run**  
  Tests are tagged so you can choose which suite to run:

  - **Unit tests only**

    ```bash
    cd backend
    pytest -m unit
    ```

  - **Integration tests only (live Supabase)**

    Make sure `.env` in `backend` is set up with a valid Supabase URL and key.

    ```bash
    cd backend
    pytest -m integration
    ```

  - **All tests (unit + integration)**

    ```bash
    cd backend
    pytest
    ```

### What the tests cover

At a high level, `test_booking_unit.py` checks:

- fetching class schedules
- booking a class under different membership tiers and schedule conditions
- validating duplicate bookings and capacity limits
- cancelling an existing booking and handling “not found” cases
- retrieving a member’s bookings
- looking up members by ID and by name

`test_integration.py` focuses on:

- hitting the `/health` endpoint to verify the API is running
- reading from live `class_schedules`, `class_bookings`, and `member` tables
- confirming that error handling works against real Supabase responses



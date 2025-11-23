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

### Test framework

- **Framework**: `pytest` with markers such as `@pytest.mark.unit` and
  `@pytest.mark.integration`.
- **HTTP client**: FastAPI `TestClient` provided by the shared `client`
  fixture in `conftest.py`, which runs the real FastAPI app in memory.
- **Mocking**: `pytest-mock` (`mocker` fixture) is used in unit tests together
  with the helper `make_chainable_query` function in `test_booking_unit.py`
  to fake Supabase query chains and control `.execute().data`.

### Configuration and setup

- **Config file**: `pytest.ini` in the `backend` folder:
  - `testpaths = tests` (only run tests from this folder)
  - `python_files = test_*.py` (all test files start with `test_`)
  - `markers` section defines `unit` and `integration` markers
  - `filterwarnings` silences known Supabase deprecation warnings
- **Environment for unit tests**:
  - No `.env` or live Supabase is required.
  - All Supabase interactions are mocked.
- **Environment for integration tests**:
  - Requires a `.env` file in the `backend` folder with valid
    `SUPABASE_URL` and `SUPABASE_KEY` values pointing to a live Supabase
    project.
  - Uses the same FastAPI app instance as production code, plus the live DB.

### Unit test cases (`test_booking_unit.py`)

- **Class schedules**
  - `test_get_classes_schedules_success`: schedules endpoint returns rows when
    Supabase returns data.

- **Book class – success path**
  - `test_book_class_success_basic_member_basic_class`: basic member
    successfully books a basic class when schedule exists, class is not full,
    membership tier is sufficient, and there is no existing booking.

- **Book class – validation and error handling**
  - `test_book_class_schedule_not_found`: booking fails with
    `"ClassSchedule not found"` when schedule ID does not exist.
  - `test_book_class_full`: booking fails when `taken_spots == total_spots`.
  - `test_book_class_member_not_found`: booking fails when Supabase does not
    return a member row.
  - `test_book_class_insufficient_tier`: basic member cannot book a premium
    class (tier too low).
  - `test_book_class_duplicate_booking`: second booking for the same
    `(user_id, schedule_id)` is rejected.
  - `test_book_class_handles_exception`: unexpected Supabase errors (e.g.
    DB down) are caught and returned as a clear error response.

- **Cancel booking**
  - `test_cancel_class_success`: successfully cancels a booking, marks it as
    cancelled, and decrements `taken_spots` on the schedule.
  - `test_cancel_class_booking_not_found`: cancellation fails with a helpful
    error when no matching booking is found for the given user and ID.

- **My bookings**
  - `test_get_my_bookings_success`: returns a list of bookings for a user,
    including nested class information.
  - `test_get_my_bookings_empty`: returns `success=True` with an empty list if
    the user has no bookings.
  - `test_get_my_bookings_error`: handles Supabase errors gracefully and
    returns `success=False` with an error message.

- **Members**
  - `test_get_member_by_id_success`: fetches a single member by ID.
  - `test_get_member_by_id_not_found`: returns a not‑found style error when
    no member is returned.
  - `test_get_member_by_name_success`: searches members by first and last
    name and returns one or more matches.
  - `test_get_member_by_name_not_found`: no matches returns `success=False`
    with a clear message.

### Integration test cases (`test_integration.py`)

- `test_health_check_live`: verifies `/health` endpoint returns
  `status="healthy"` and confirms the API is running.
- `test_get_classes_schedules_live`: fetches class schedules from the real
  `class_schedules` table, checking basic structure.
- `test_get_classes_filter_live`: verifies date filtering against the real
  database using a `date` query parameter.
- `test_get_member_not_found_live`: calls `/members/{member_id}` with a
  random UUID to exercise real `member` table behavior when no rows match.
- `test_get_my_bookings_empty_live`: calls `/classes/my-bookings` with a
  random `user_id` and expects `success=True` with an empty `bookings` list.



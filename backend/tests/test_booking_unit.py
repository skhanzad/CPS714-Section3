"""
Unit tests for the booking API using **mocked Supabase**.

Key ideas to learn from this file:
- we use pytest functions like `@pytest.mark.unit` to label tests
- we use fixtures such as `client`, `basic_member_data` from `conftest.py`
- we replace the real `supabase` object with a mock so that no real DB is used
"""

from types import SimpleNamespace

import pytest

import main


def make_chainable_query(mocker, data):
    """
    Build a fake Supabase query object.

    In the real code we do:
        supabase.table(...).select(...).eq(...).execute()

    Each method (`select`, `eq`, etc.) returns the query again (so you can
    chain calls), and finally `.execute()` returns an object with `.data`.
    """
    query = mocker.MagicMock()
    for method in [
        "select",
        "gte",
        "lte",
        "eq",
        "order",
        "update",
        "insert",
        "is_",
        "single",
    ]:
        # Each method should return the same query object so calls can be chained
        getattr(query, method).return_value = query

    # When the app calls `.execute()`, return something that has a `.data` attribute
    query.execute.return_value = SimpleNamespace(data=data)
    return query


@pytest.mark.unit
def test_get_classes_schedules_success(client, mocker):
    """
    Happy path: the schedules endpoint returns data when Supabase returns rows.
    """
    # ARRANGE: Set up fake data that we want Supabase to return
    data = [{"id": 1, "scheduled_date": "2025-01-01"}]
    query = make_chainable_query(mocker, data)

    # Replace `main.supabase` with a mock that returns our fake query
    # When the app calls supabase.table('class_schedules'), it gets our mock query
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Call the real FastAPI endpoint through the test client
    # This makes an HTTP GET request without starting a real server
    response = client.get("/classes/schedules")

    # ASSERT: Check that the response is correct
    assert response.status_code == 200  # HTTP 200 OK
    assert response.json() == data  # Response body matches our fake data


@pytest.mark.unit
def test_book_class_success_basic_member_basic_class(
    client, mocker, basic_class_schedule, basic_member_data
):
    """
    Happy path test: Booking works when:
    - schedule exists
    - member exists
    - class is not full
    - member has a high-enough tier
    - no existing booking for that schedule+user
    """
    # ARRANGE: The booking endpoint makes 5 sequential database queries
    # We need to mock all 5 in the correct order using `side_effect`
    
    # 1) Schedule lookup - return a valid basic class schedule
    schedule_query = make_chainable_query(mocker, [basic_class_schedule])

    # 2) Member lookup - return the member's status to validate tier access
    # The endpoint only needs the member_status field for validation
    member_query = make_chainable_query(
        mocker, [{"member_status": basic_member_data["member_status"]}]
    )

    # 3) Existing booking check - return empty list (no duplicate booking exists)
    existing_booking_query = make_chainable_query(mocker, [])

    # 4) Insert booking - simulate Supabase returning the newly created booking
    # In real Supabase, .insert().execute() returns the inserted row with its ID
    booking_row = {
        "id": 10,
        "schedule_id": basic_class_schedule["id"],
        "user_id": basic_member_data["member_id"],
    }
    insert_booking_query = make_chainable_query(mocker, [booking_row])

    # 5) Update schedule taken_spots - return empty (we don't use this response)
    update_schedule_query = make_chainable_query(mocker, [])

    # Set up supabase mock with side_effect to return different queries in sequence
    # Each time supabase.table() is called, it returns the next mock in this list
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = [
        schedule_query,          # First .table() call
        member_query,            # Second .table() call
        existing_booking_query,  # Third .table() call
        insert_booking_query,    # Fourth .table() call
        update_schedule_query,   # Fifth .table() call
    ]

    # Patch the global supabase object in main.py with our mock
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Make a POST request to book the class
    response = client.post(
        "/classes/book",
        json={
            "user_id": basic_member_data["member_id"],
            "schedule_id": basic_class_schedule["id"],
        },
    )

    # ASSERT: Verify the booking was successful
    body = response.json()
    assert response.status_code == 200  # HTTP 200 OK
    assert body["success"] is True  # Success flag is true
    assert body["booking"]["id"] == booking_row["id"]  # Booking ID matches
    assert body["class_name"] == basic_class_schedule["class"]["class_name"]  # Class name included


@pytest.mark.unit
def test_book_class_schedule_not_found(client, mocker, basic_member_data):
    """
    Error case: If the schedule_id does not exist, the API should return an error message.
    Tests the first validation step in the booking flow.
    """
    # ARRANGE: Schedule lookup returns empty list -> schedule not found
    # This simulates querying for a schedule ID that doesn't exist in the database
    schedule_query = make_chainable_query(mocker, [])

    # Mock supabase to return empty schedule query
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = schedule_query
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Try to book a non-existent schedule (ID 999)
    response = client.post(
        "/classes/book",
        json={"user_id": basic_member_data["member_id"], "schedule_id": 999},
    )

    # ASSERT: Should get an error response (not crash!)
    body = response.json()
    assert response.status_code == 200  # Still 200, but with success=False
    assert body["success"] is False  # Operation failed
    assert body["message"] == "ClassSchedule not found"  # Clear error message


@pytest.mark.unit
def test_book_class_full(client, mocker, basic_class_schedule, basic_member_data):
    """
    Error case: When taken_spots == total_spots, the class is full and booking must fail.
    Tests the capacity validation logic.
    """
    # ARRANGE: Mark class as full by copying the fixture and overriding fields
    # Using spread operator (**) to copy all fields, then override specific ones
    full_schedule = {**basic_class_schedule, "taken_spots": 20, "total_spots": 20}
    schedule_query = make_chainable_query(mocker, [full_schedule])

    # Mock supabase to return the full schedule
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = schedule_query
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Try to book a class that's at full capacity
    response = client.post(
        "/classes/book",
        json={
            "user_id": basic_member_data["member_id"],
            "schedule_id": full_schedule["id"],
        },
    )

    # ASSERT: Should be rejected because the class is full
    body = response.json()
    assert response.status_code == 200  # Still 200, but with success=False
    assert body["success"] is False  # Booking failed
    assert "Class is full" in body["message"]  # Error explains why


@pytest.mark.unit
def test_book_class_member_not_found(client, mocker, basic_class_schedule):
    """
    Error case: If Supabase does not return any member row, we show a helpful error message.
    Tests member existence validation.
    """
    # ARRANGE: Set up two database queries
    # 1) Schedule exists and passes validation
    schedule_query = make_chainable_query(mocker, [basic_class_schedule])
    
    # 2) Member lookup returns empty - member doesn't exist in database
    member_query = make_chainable_query(mocker, [])

    # Use side_effect to return different mocks for sequential .table() calls
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = [
        schedule_query,  # First call: check schedule
        member_query,    # Second call: check member (fails here)
    ]
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Try to book with a user ID that doesn't exist
    response = client.post(
        "/classes/book",
        json={"user_id": "missing-user", "schedule_id": basic_class_schedule["id"]},
    )

    # ASSERT: Should fail because member doesn't exist
    body = response.json()
    assert response.status_code == 200  # Still 200, but with success=False
    assert body["success"] is False  # Booking failed
    assert "Member not found" in body["message"]  # Helpful error message


@pytest.mark.unit
def test_book_class_insufficient_tier(
    client, mocker, premium_class_schedule, basic_member_data
):
    """
    Error case: Basic member trying to book a premium class should be blocked.
    Tests membership tier validation (basic < premium < vip).
    """
    # ARRANGE: Set up a scenario where tier levels don't match
    # Schedule exists and requires premium tier
    schedule_query = make_chainable_query(mocker, [premium_class_schedule])

    # Member has basic tier (insufficient for premium class)
    member_query = make_chainable_query(
        mocker, [{"member_status": basic_member_data["member_status"]}]
    )

    # Mock the two database queries needed before tier validation
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = [
        schedule_query,  # First: get schedule (premium)
        member_query,    # Second: get member tier (basic) - fails validation
    ]
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Basic member tries to book a premium class
    response = client.post(
        "/classes/book",
        json={
            "user_id": basic_member_data["member_id"],
            "schedule_id": premium_class_schedule["id"],
        },
    )

    # ASSERT: Should be rejected due to insufficient membership tier
    body = response.json()
    assert response.status_code == 200  # Still 200, but with success=False
    assert body["success"] is False  # Booking failed
    # Error message should mention tier requirement
    assert "requires premium" in body["message"] or "requires" in body["message"]


@pytest.mark.unit
def test_book_class_duplicate_booking(
    client, mocker, basic_class_schedule, basic_member_data
):
    """
    Error case: If there is already an active booking for (user, schedule), API must reject
    a second booking. Prevents users from booking the same class twice.
    """
    # ARRANGE: Set up scenario where user tries to double-book
    # 1) Schedule exists and has capacity
    schedule_query = make_chainable_query(mocker, [basic_class_schedule])

    # 2) Member exists with correct tier
    member_query = make_chainable_query(
        mocker, [{"member_status": basic_member_data["member_status"]}]
    )

    # 3) Existing active booking found for this user+schedule combination
    # This is the key part: returning a booking means duplicate detected
    existing_booking_query = make_chainable_query(
        mocker,
        [
            {
                "id": 1,
                "schedule_id": basic_class_schedule["id"],
                "user_id": basic_member_data["member_id"],
            }
        ],
    )

    # Mock the three database queries needed to reach duplicate check
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = [
        schedule_query,            # First: verify schedule
        member_query,              # Second: verify member
        existing_booking_query,    # Third: check for duplicates (finds one!)
    ]
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Try to book a class that user already booked
    response = client.post(
        "/classes/book",
        json={
            "user_id": basic_member_data["member_id"],
            "schedule_id": basic_class_schedule["id"],
        },
    )

    # ASSERT: Should be rejected to prevent double-booking
    body = response.json()
    assert response.status_code == 200  # Still 200, but with success=False
    assert body["success"] is False  # Booking failed
    assert "already booked" in body["message"]  # Clear duplicate error


@pytest.mark.unit
def test_book_class_handles_exception(client, mocker, basic_member_data):
    """
    Error handling test: If something unexpected goes wrong (e.g. Supabase down), 
    we still return a clear error response instead of crashing.
    Tests the try-except block in the booking endpoint.
    """
    # ARRANGE: Force an exception during Supabase call
    # This simulates database being down or network error
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = RuntimeError("Supabase unavailable")
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Try to book a class when database is "down"
    response = client.post(
        "/classes/book",
        json={"user_id": basic_member_data["member_id"], "schedule_id": 1},
    )

    # ASSERT: Should gracefully handle error without crashing
    body = response.json()
    assert response.status_code == 200  # Still returns 200 (not 500)
    assert body["success"] is False  # But marks operation as failed
    assert "Error booking class" in body["message"]  # Generic error message


@pytest.mark.unit
def test_cancel_class_success(client, mocker):
    """
    Happy path: user cancels a booking and we update both the booking and schedule.
    Tests that cancellation reduces taken_spots and marks booking as cancelled.
    """
    # ARRANGE: Set up the 3 database operations needed for cancellation
    
    # 1) Booking lookup with embedded class_schedules relationship
    # Note: Supabase can return nested data with .select('*, class_schedules(...)')
    booking_row = {
        "id": 1,
        "user_id": "user-1",
        "schedule_id": 5,
        "booking_status": "confirmed",  # Currently confirmed
        "cancelled_at": None,  # Not yet cancelled
        "class_schedules": {"taken_spots": 3, "total_spots": 10},  # Nested data
    }
    booking_query = make_chainable_query(mocker, [booking_row])

    # 2) Update booking - mark as cancelled with timestamp
    update_booking_query = make_chainable_query(mocker, [])

    # 3) Update schedule - decrement taken_spots by 1
    update_schedule_query = make_chainable_query(mocker, [])

    # Mock the three sequential database operations
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = [
        booking_query,          # First: find the booking
        update_booking_query,   # Second: mark booking as cancelled
        update_schedule_query,  # Third: free up the spot
    ]
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Cancel the booking
    response = client.post(
        "/classes/cancel",
        json={"user_id": booking_row["user_id"], "booking_id": booking_row["id"]},
    )

    # ASSERT: Cancellation should succeed
    body = response.json()
    assert response.status_code == 200  # HTTP 200 OK
    assert body["success"] is True  # Cancellation succeeded
    assert body["booking_id"] == booking_row["id"]  # Returns the cancelled booking ID


@pytest.mark.unit
def test_cancel_class_booking_not_found(client, mocker):
    """
    Error case: If no booking matches the booking_id + user_id, we return an error.
    This also prevents users from cancelling other people's bookings.
    """
    # ARRANGE: Booking lookup returns empty - either ID doesn't exist or doesn't belong to user
    # The query checks both booking_id AND user_id for security
    booking_query = make_chainable_query(mocker, [])

    # Mock supabase to return empty result
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = booking_query
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Try to cancel a booking that doesn't exist or doesn't belong to user
    response = client.post(
        "/classes/cancel",
        json={"user_id": "user-1", "booking_id": 999},
    )

    # ASSERT: Should fail gracefully with clear error
    body = response.json()
    assert response.status_code == 200  # Still 200, but with success=False
    assert body["success"] is False  # Cancellation failed
    assert "Booking not found" in body["message"]  # Explains why it failed


@pytest.mark.unit
def test_get_my_bookings_success(client, mocker):
    """
    Happy path: When bookings exist for a user, we return them in the response.
    Tests the GET endpoint that shows a user's booking history.
    """
    # ARRANGE: Create fake booking data with nested relationships
    # Real Supabase query uses: .select('*, class_schedules(*, class(*))')
    bookings = [
        {
            "id": 1,
            "user_id": "user-1",
            "schedule_id": 5,
            "class_schedules": {"class": {"class_name": "Yoga"}},  # Nested class info
        }
    ]
    query = make_chainable_query(mocker, bookings)

    # Mock supabase to return the bookings
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Get bookings for user-1
    response = client.get("/classes/my-bookings", params={"user_id": "user-1"})

    # ASSERT: Should return the user's bookings
    body = response.json()
    assert response.status_code == 200  # HTTP 200 OK
    assert body["success"] is True  # Query succeeded
    assert body["bookings"] == bookings  # Returns the booking list


@pytest.mark.unit
def test_get_my_bookings_empty(client, mocker):
    """
    Edge case: If there are no bookings, we still return success with an empty list.
    This is NOT an error - some users just haven't booked anything yet.
    """
    # ARRANGE: Query returns empty list (user has no bookings)
    query = make_chainable_query(mocker, [])

    # Mock supabase to return empty bookings
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Get bookings for a user with no bookings
    response = client.get("/classes/my-bookings", params={"user_id": "user-1"})

    # ASSERT: Should succeed with empty array (not an error!)
    body = response.json()
    assert response.status_code == 200  # HTTP 200 OK
    assert body["success"] is True  # Still successful
    assert body["bookings"] == []  # Just empty results


@pytest.mark.unit
def test_get_my_bookings_error(client, mocker):
    """
    Error handling test: If Supabase raises an exception, the endpoint should 
    return an error response instead of crashing.
    """
    # ARRANGE: Force database error
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = RuntimeError("DB error")
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Try to get bookings when database is "down"
    response = client.get("/classes/my-bookings", params={"user_id": "user-1"})

    # ASSERT: Should gracefully handle the error
    body = response.json()
    assert response.status_code == 200  # Still 200 (not 500)
    assert body["success"] is False  # But marks as failed
    assert "Error retrieving bookings" in body["message"]  # Clear error message


@pytest.mark.unit
def test_get_member_by_id_success(client, mocker):
    """
    Happy path: Successfully fetch a single member by ID.
    Tests the GET /members/{member_id} endpoint.
    """
    # ARRANGE: Create fake member data to return
    member_row = {
        "member_id": "member-1",
        "first_name": "Test",
        "last_name": "User",
        "member_status": "basic",
    }
    # Note: .single() query returns the object directly, not in an array
    query = make_chainable_query(mocker, member_row)

    # Mock supabase to return the member
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Get member by ID using path parameter
    response = client.get("/members/member-1")

    # ASSERT: Should return the member data
    body = response.json()
    assert response.status_code == 200  # HTTP 200 OK
    assert body["success"] is True  # Query succeeded
    assert body["member"]["member_id"] == "member-1"  # Returns correct member


@pytest.mark.unit
def test_get_member_by_id_not_found(client, mocker):
    """
    Error case: If Supabase returns no data, the API reports that the member was not found.
    Tests behavior when querying a non-existent member ID.
    """
    # ARRANGE: Query returns None (member doesn't exist)
    # .single() returns None instead of empty array when no match found
    query = make_chainable_query(mocker, None)

    # Mock supabase to return None
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Try to get a member that doesn't exist
    response = client.get("/members/missing-id")

    # ASSERT: Should return not found error
    body = response.json()
    assert response.status_code == 200  # Still 200, but with success=False
    assert body["success"] is False  # Query "succeeded" but found nothing
    assert "not found" in body["message"]  # Clear error message


@pytest.mark.unit
def test_get_member_by_name_success(client, mocker):
    """
    Happy path: Fetch one or more members by first and last name.
    Tests the GET /members/name endpoint with query parameters.
    Useful for searching members when you don't know their ID.
    """
    # ARRANGE: Create fake member data to return
    # Note: Could return multiple members with same name (array)
    members = [
        {
            "member_id": "member-1",
            "first_name": "Jane",
            "last_name": "Doe",
            "member_status": "premium",
        }
    ]
    query = make_chainable_query(mocker, members)

    # Mock supabase to return matching members
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Search for member by name using query parameters
    response = client.get(
        "/members/name", params={"first_name": "Jane", "last_name": "Doe"}
    )

    # ASSERT: Should return the matching member(s)
    body = response.json()
    assert response.status_code == 200  # HTTP 200 OK
    assert body["success"] is True  # Search succeeded
    assert len(body["members"]) == 1  # Found 1 match
    assert body["members"][0]["member_id"] == "member-1"  # Correct member returned


@pytest.mark.unit
def test_get_member_by_name_not_found(client, mocker):
    """
    Error case: If no members match the provided name, we return a not found message.
    Tests search behavior when name doesn't exist in database.
    """
    # ARRANGE: Query returns empty array (no matching names)
    query = make_chainable_query(mocker, [])

    # Mock supabase to return no matches
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    # ACT: Search for a name that doesn't exist
    response = client.get(
        "/members/name", params={"first_name": "No", "last_name": "User"}
    )

    # ASSERT: Should return not found error
    body = response.json()
    assert response.status_code == 200  # Still 200, but with success=False
    assert body["success"] is False  # No results found
    assert "not found" in body["message"]  # Clear error message



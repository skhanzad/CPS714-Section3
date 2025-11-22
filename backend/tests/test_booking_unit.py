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
    data = [{"id": 1, "scheduled_date": "2025-01-01"}]
    query = make_chainable_query(mocker, data)

    # Replace `main.supabase` with a mock that returns our fake query
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    # Call the real FastAPI endpoint through the test client
    response = client.get("/classes/schedules")

    # Assert the HTTP status and response body
    assert response.status_code == 200
    assert response.json() == data


@pytest.mark.unit
def test_book_class_success_basic_member_basic_class(
    client, mocker, basic_class_schedule, basic_member_data
):
    """
    Booking works when:
    - schedule exists
    - member exists
    - class is not full
    - member has a high-enough tier
    - no existing booking for that schedule+user
    """
    # 1) Schedule lookup
    schedule_query = make_chainable_query(mocker, [basic_class_schedule])

    # 2) Member lookup (returns a single row with `member_status`)
    member_query = make_chainable_query(
        mocker, [{"member_status": basic_member_data["member_status"]}]
    )

    # 3) Existing booking check (no existing booking)
    existing_booking_query = make_chainable_query(mocker, [])

    # 4) Insert booking (Supabase will return the newly created booking row)
    booking_row = {
        "id": 10,
        "schedule_id": basic_class_schedule["id"],
        "user_id": basic_member_data["member_id"],
    }
    insert_booking_query = make_chainable_query(mocker, [booking_row])

    # 5) Update schedule taken_spots (we do not care about the return value here)
    update_schedule_query = make_chainable_query(mocker, [])

    # The order of `.table()` calls in the app matches this `side_effect` list
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = [
        schedule_query,
        member_query,
        existing_booking_query,
        insert_booking_query,
        update_schedule_query,
    ]

    mocker.patch("main.supabase", supabase_mock)

    response = client.post(
        "/classes/book",
        json={
            "user_id": basic_member_data["member_id"],
            "schedule_id": basic_class_schedule["id"],
        },
    )

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is True
    assert body["booking"]["id"] == booking_row["id"]
    assert body["class_name"] == basic_class_schedule["class"]["class_name"]


@pytest.mark.unit
def test_book_class_schedule_not_found(client, mocker, basic_member_data):
    """
    If the schedule_id does not exist, the API should return an error message.
    """
    # Schedule lookup returns empty list -> schedule not found
    schedule_query = make_chainable_query(mocker, [])

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = schedule_query
    mocker.patch("main.supabase", supabase_mock)

    response = client.post(
        "/classes/book",
        json={"user_id": basic_member_data["member_id"], "schedule_id": 999},
    )

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is False
    assert body["message"] == "ClassSchedule not found"


@pytest.mark.unit
def test_book_class_full(client, mocker, basic_class_schedule, basic_member_data):
    """
    When taken_spots == total_spots, the class is full and booking must fail.
    """
    # Mark class as full by copying the fixture and overriding fields
    full_schedule = {**basic_class_schedule, "taken_spots": 20, "total_spots": 20}
    schedule_query = make_chainable_query(mocker, [full_schedule])

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = schedule_query
    mocker.patch("main.supabase", supabase_mock)

    response = client.post(
        "/classes/book",
        json={
            "user_id": basic_member_data["member_id"],
            "schedule_id": full_schedule["id"],
        },
    )

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is False
    assert "Class is full" in body["message"]


@pytest.mark.unit
def test_book_class_member_not_found(client, mocker, basic_class_schedule):
    """
    If Supabase does not return any member row, we show a helpful error message.
    """
    # Schedule exists
    schedule_query = make_chainable_query(mocker, [basic_class_schedule])
    # Member lookup returns empty
    member_query = make_chainable_query(mocker, [])

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = [
        schedule_query,
        member_query,
    ]
    mocker.patch("main.supabase", supabase_mock)

    response = client.post(
        "/classes/book",
        json={"user_id": "missing-user", "schedule_id": basic_class_schedule["id"]},
    )

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is False
    assert "Member not found" in body["message"]


@pytest.mark.unit
def test_book_class_insufficient_tier(
    client, mocker, premium_class_schedule, basic_member_data
):
    """
    Basic member trying to book a premium class should be blocked.
    """
    # Schedule exists and is premium
    schedule_query = make_chainable_query(mocker, [premium_class_schedule])

    # Member is basic
    member_query = make_chainable_query(
        mocker, [{"member_status": basic_member_data["member_status"]}]
    )

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = [
        schedule_query,
        member_query,
    ]
    mocker.patch("main.supabase", supabase_mock)

    response = client.post(
        "/classes/book",
        json={
            "user_id": basic_member_data["member_id"],
            "schedule_id": premium_class_schedule["id"],
        },
    )

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is False
    assert "requires premium" in body["message"] or "requires" in body["message"]


@pytest.mark.unit
def test_book_class_duplicate_booking(
    client, mocker, basic_class_schedule, basic_member_data
):
    """
    If there is already an active booking for (user, schedule), API must reject
    a second booking.
    """
    # Schedule exists
    schedule_query = make_chainable_query(mocker, [basic_class_schedule])

    # Member exists
    member_query = make_chainable_query(
        mocker, [{"member_status": basic_member_data["member_status"]}]
    )

    # Existing active booking found
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

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = [
        schedule_query,
        member_query,
        existing_booking_query,
    ]
    mocker.patch("main.supabase", supabase_mock)

    response = client.post(
        "/classes/book",
        json={
            "user_id": basic_member_data["member_id"],
            "schedule_id": basic_class_schedule["id"],
        },
    )

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is False
    assert "already booked" in body["message"]


@pytest.mark.unit
def test_book_class_handles_exception(client, mocker, basic_member_data):
    """
    If something unexpected goes wrong (e.g. Supabase down), we still
    return a clear error response instead of crashing.
    """
    # Force an exception during Supabase call
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = RuntimeError("Supabase unavailable")
    mocker.patch("main.supabase", supabase_mock)

    response = client.post(
        "/classes/book",
        json={"user_id": basic_member_data["member_id"], "schedule_id": 1},
    )

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is False
    assert "Error booking class" in body["message"]


@pytest.mark.unit
def test_cancel_class_success(client, mocker):
    """
    Happy path: user cancels a booking and we update both the booking and schedule.
    """
    # Booking lookup with embedded class_schedules
    booking_row = {
        "id": 1,
        "user_id": "user-1",
        "schedule_id": 5,
        "booking_status": "confirmed",
        "cancelled_at": None,
        "class_schedules": {"taken_spots": 3, "total_spots": 10},
    }
    booking_query = make_chainable_query(mocker, [booking_row])

    # Update booking
    update_booking_query = make_chainable_query(mocker, [])

    # Update schedule
    update_schedule_query = make_chainable_query(mocker, [])

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = [
        booking_query,
        update_booking_query,
        update_schedule_query,
    ]
    mocker.patch("main.supabase", supabase_mock)

    response = client.post(
        "/classes/cancel",
        json={"user_id": booking_row["user_id"], "booking_id": booking_row["id"]},
    )

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is True
    assert body["booking_id"] == booking_row["id"]


@pytest.mark.unit
def test_cancel_class_booking_not_found(client, mocker):
    """
    If no booking matches the booking_id + user_id, we return an error.
    """
    booking_query = make_chainable_query(mocker, [])

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = booking_query
    mocker.patch("main.supabase", supabase_mock)

    response = client.post(
        "/classes/cancel",
        json={"user_id": "user-1", "booking_id": 999},
    )

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is False
    assert "Booking not found" in body["message"]


@pytest.mark.unit
def test_get_my_bookings_success(client, mocker):
    """
    When bookings exist for a user, we return them in the response.
    """
    bookings = [
        {
            "id": 1,
            "user_id": "user-1",
            "schedule_id": 5,
            "class_schedules": {"class": {"class_name": "Yoga"}},
        }
    ]
    query = make_chainable_query(mocker, bookings)

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    response = client.get("/classes/my-bookings", params={"user_id": "user-1"})

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is True
    assert body["bookings"] == bookings


@pytest.mark.unit
def test_get_my_bookings_empty(client, mocker):
    """
    If there are no bookings, we still return success with an empty list.
    """
    query = make_chainable_query(mocker, [])

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    response = client.get("/classes/my-bookings", params={"user_id": "user-1"})

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is True
    assert body["bookings"] == []


@pytest.mark.unit
def test_get_my_bookings_error(client, mocker):
    """
    If Supabase raises an exception, the endpoint should return an error response.
    """
    supabase_mock = mocker.MagicMock()
    supabase_mock.table.side_effect = RuntimeError("DB error")
    mocker.patch("main.supabase", supabase_mock)

    response = client.get("/classes/my-bookings", params={"user_id": "user-1"})

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is False
    assert "Error retrieving bookings" in body["message"]


@pytest.mark.unit
def test_get_member_by_id_success(client, mocker):
    """
    Successfully fetch a single member by ID.
    """
    member_row = {
        "member_id": "member-1",
        "first_name": "Test",
        "last_name": "User",
        "member_status": "basic",
    }
    query = make_chainable_query(mocker, member_row)

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    response = client.get("/members/member-1")

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is True
    assert body["member"]["member_id"] == "member-1"


@pytest.mark.unit
def test_get_member_by_id_not_found(client, mocker):
    """
    If Supabase returns no data, the API reports that the member was not found.
    """
    query = make_chainable_query(mocker, None)

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    response = client.get("/members/missing-id")

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is False
    assert "not found" in body["message"]


@pytest.mark.unit
def test_get_member_by_name_success(client, mocker):
    """
    Fetch one or more members by first and last name.
    """
    members = [
        {
            "member_id": "member-1",
            "first_name": "Jane",
            "last_name": "Doe",
            "member_status": "premium",
        }
    ]
    query = make_chainable_query(mocker, members)

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    response = client.get(
        "/members/name", params={"first_name": "Jane", "last_name": "Doe"}
    )

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is True
    assert len(body["members"]) == 1
    assert body["members"][0]["member_id"] == "member-1"


@pytest.mark.unit
def test_get_member_by_name_not_found(client, mocker):
    """
    If no members match the provided name, we return a not found message.
    """
    query = make_chainable_query(mocker, [])

    supabase_mock = mocker.MagicMock()
    supabase_mock.table.return_value = query
    mocker.patch("main.supabase", supabase_mock)

    response = client.get(
        "/members/name", params={"first_name": "No", "last_name": "User"}
    )

    body = response.json()
    assert response.status_code == 200
    assert body["success"] is False
    assert "not found" in body["message"]



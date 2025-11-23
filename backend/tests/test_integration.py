import pytest
from datetime import datetime
import uuid

@pytest.mark.integration
def test_health_check_live(client):
    """
    Verify the API is up and running.
    Does not hit the DB, but confirms the app is initialized.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

@pytest.mark.integration
def test_get_classes_schedules_live(client):
    """
    Verify we can fetch class schedules from the real Supabase database.
    This confirms connection to the 'class_schedules' table.
    """
    response = client.get("/classes/schedules")
    assert response.status_code == 200
    data = response.json()
    # We expect a list (might be empty if DB is empty, but should be a list)
    assert isinstance(data, list)
    # If there is data, check structure
    if len(data) > 0:
        assert "id" in data[0]
        assert "class" in data[0]

@pytest.mark.integration
def test_get_classes_filter_live(client):
    """
    Verify date filtering on the real database.
    """
    today = datetime.now().date().isoformat()
    response = client.get(f"/classes/schedules?date={today}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Verify returned items match the date (if any)
    for item in data:
        assert item["scheduled_date"] == today

@pytest.mark.integration
def test_get_member_not_found_live(client):
    """
    Verify reading from the 'member' table.
    Using a random UUID that shouldn't exist ensures we don't need specific seed data.
    """
    random_id = str(uuid.uuid4())
    response = client.get(f"/members/{random_id}")
    # The API returns 200 OK with success=False.
    # Supabase .single() raises an exception if 0 rows found, which main.py catches.
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    msg = data["message"].lower()
    # Check for either explicit "not found" or the Supabase "0 rows" error
    assert "not found" in msg or "0 rows" in msg or "pgrst116" in msg

@pytest.mark.integration
def test_get_my_bookings_empty_live(client):
    """
    Verify reading from 'class_bookings' table.
    Using a random UUID user ensures we get an empty list (or not found response).
    """
    random_user_id = str(uuid.uuid4())
    response = client.get(f"/classes/my-bookings?user_id={random_user_id}")
    assert response.status_code == 200
    data = response.json()
    # API returns success=True with empty list if no bookings found
    assert data["success"] is True
    assert data["bookings"] == []


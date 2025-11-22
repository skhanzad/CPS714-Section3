"""
Shared fixtures for pytest.

Think of a fixture as **reusable setup code** that you can inject into any test
just by adding its name as a function parameter.
"""

import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Ensure the backend directory (where main.py lives) is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    """
    Create a single FastAPI TestClient for the whole test session.

    - It starts your FastAPI app in memory (no real HTTP server).
    - Tests can call your endpoints with `client.get(...)`, `client.post(...)`, etc.
    - We still mock Supabase so no real database is touched.
    """
    return TestClient(app)


@pytest.fixture
def basic_member_data():
    """
    Fake 'basic' member we can use in tests.
    """
    return {
        "member_id": "basic-user-id",
        "first_name": "Basic",
        "last_name": "User",
        "member_status": "basic",
    }


@pytest.fixture
def premium_member_data():
    """
    Fake 'premium' member we can use in tests.
    """
    return {
        "member_id": "premium-user-id",
        "first_name": "Premium",
        "last_name": "User",
        "member_status": "premium",
    }


@pytest.fixture
def vip_member_data():
    """
    Fake 'vip' member we can use in tests.
    """
    return {
        "member_id": "vip-user-id",
        "first_name": "Vip",
        "last_name": "User",
        "member_status": "vip",
    }


@pytest.fixture
def basic_class_schedule():
    """
    Fake schedule for a basic (non-premium) class.
    """
    return {
        "id": 1,
        "scheduled_date": "2025-01-01",
        "time_from": "09:00:00",
        "time_to": "10:00:00",
        "taken_spots": 0,
        "total_spots": 20,
        "class": {
            "class_name": "Morning Yoga",
            "premium_status": "basic",
        },
    }


@pytest.fixture
def premium_class_schedule():
    """
    Fake schedule for a premium class.
    """
    return {
        "id": 2,
        "scheduled_date": "2025-01-01",
        "time_from": "11:00:00",
        "time_to": "12:00:00",
        "taken_spots": 0,
        "total_spots": 10,
        "class": {
            "class_name": "Premium Spin",
            "premium_status": "premium",
        },
    }



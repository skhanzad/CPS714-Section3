import pytest

from backend import waitlist
from backend.config import EQUIPMENT_TYPES


@pytest.fixture(autouse=True)
def reset_waitlists():
    # Reinitialize waitlist storage for each test to ensure independence
    waitlist.init_queues()
    yield


def test_init_creates_empty_queues():
    waitlist.init_queues()
    for equipment in EQUIPMENT_TYPES:
        assert waitlist.get_queue(equipment) == []


def test_join_queue_order_and_idempotency():
    pos1 = waitlist.join_queue("squat_rack", "ID001")
    pos2 = waitlist.join_queue("squat_rack", "ID002")
    pos3 = waitlist.join_queue("squat_rack", "ID001")  # duplicate returns original position

    assert (pos1, pos2, pos3) == (1, 2, 1)
    assert waitlist.get_queue("squat_rack") == ["ID001", "ID002"]


def test_pop_next_and_leave_behaviour():
    waitlist.join_queue("bench_press", "ID010")
    waitlist.join_queue("bench_press", "ID011")

    next_up = waitlist.pop_next_in_queue("bench_press")
    assert next_up == "ID010"
    assert waitlist.get_queue("bench_press") == ["ID011"]

    removed = waitlist.leave_queue("bench_press", "ID011")
    assert removed is True
    assert waitlist.get_queue("bench_press") == []

    # Removing a non-existent member returns False
    assert waitlist.leave_queue("bench_press", "ID999") is False


def test_get_position_and_missing_member():
    waitlist.join_queue("smith_machine", "ID100")
    waitlist.join_queue("smith_machine", "ID101")

    assert waitlist.get_position("smith_machine", "ID100") == 1
    assert waitlist.get_position("smith_machine", "ID101") == 2
    assert waitlist.get_position("smith_machine", "ID999") is None


def test_unknown_equipment_raises():
    with pytest.raises(ValueError):
        waitlist.get_queue("unknown_equipment")

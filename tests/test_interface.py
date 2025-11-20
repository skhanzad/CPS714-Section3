import importlib
import pytest

import backend.config as config
import backend.events as events
import backend.waitlist as waitlist
import backend.capacity as capacity
import backend.interface as interface


@pytest.fixture(autouse=True)
def fresh_backend_state():
    global events, waitlist, capacity, interface
    # Reload modules to reset globals (listeners, queues, tracker)
    events = importlib.reload(events)
    waitlist = importlib.reload(waitlist)
    capacity = importlib.reload(capacity)
    interface = importlib.reload(interface)
    interface.init_system()
    yield


def test_capacity_event_emitted_on_check_in_and_out():
    captured = []
    interface.subscribe("capacity_updated", lambda payload: captured.append(payload))

    assert interface.check_in_member("M1") is True
    assert captured[-1]["count"] == 1
    assert captured[-1]["max_capacity"] == config.MAX_CAPACITY

    # Duplicate check-in should not emit a new event
    before = len(captured)
    assert interface.check_in_member("M1") is False
    assert len(captured) == before

    assert interface.check_out_member("M1") is True
    assert captured[-1]["count"] == 0


def test_waitlist_event_emitted_on_join_pop_leave():
    captured = []
    interface.subscribe("waitlist_updated", lambda payload: captured.append(payload))

    pos1 = interface.join_equipment_waitlist("squat_rack", "A")
    assert pos1 == 1
    assert captured[-1]["queue"] == ["A"]

    pos2 = interface.join_equipment_waitlist("squat_rack", "B")
    assert pos2 == 2
    assert captured[-1]["queue"] == ["A", "B"]

    next_id = interface.pop_next_for_equipment("squat_rack")
    assert next_id == "A"
    assert captured[-1]["queue"] == ["B"]

    removed = interface.leave_equipment_waitlist("squat_rack", "B")
    assert removed is True
    assert captured[-1]["queue"] == []


def test_interface_waitlist_snapshot_helpers():
    interface.join_equipment_waitlist("bench_press", "X")
    interface.join_equipment_waitlist("bench_press", "Y")

    assert interface.get_equipment_queue("bench_press") == ["X", "Y"]
    all_lists = interface.get_all_waitlists()
    assert all_lists["bench_press"] == ["X", "Y"]

    assert interface.get_member_position("bench_press", "X") == 1
    assert interface.get_member_position("bench_press", "missing") is None


def test_unknown_equipment_errors_propagate():
    with pytest.raises(ValueError):
        interface.join_equipment_waitlist("unknown_equipment", "ID001")

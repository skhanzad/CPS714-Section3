from typing import Callable, Dict, List, Any

_listeners: Dict[str, List[Callable[[Any], None]]] = {}


def on(event_name: str, callback: Callable[[Any], None]) -> None:
    if event_name not in _listeners:
        _listeners[event_name] = []
    _listeners[event_name].append(callback)


def emit(event_name: str, payload: Any) -> None:
    for cb in _listeners.get(event_name, []):
        cb(payload)

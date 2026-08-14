import asyncio
import json
from typing import Set, Dict, Any, Optional


class EventManager:
    """In-memory Server-Sent Events (SSE) broadcast hub for real-time state synchronization."""

    def __init__(self):
        self._subscribers: Set[asyncio.Queue] = set()

    async def subscribe(self) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers.add(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        self._subscribers.discard(queue)

    async def broadcast(self, event_type: str, data: Optional[Dict[str, Any]] = None) -> None:
        payload = {"type": event_type, "data": data or {}}
        for queue in list(self._subscribers):
            try:
                queue.put_nowait(payload)
            except Exception:
                pass


event_manager = EventManager()

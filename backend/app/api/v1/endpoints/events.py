import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.core.events import event_manager

router = APIRouter(prefix="/events", tags=["Realtime Events"])


@router.get("")
async def subscribe_realtime_events():
    """Server-Sent Events (SSE) stream for real-time frontend catalog & cart invalidation."""

    async def event_generator():
        queue = await event_manager.subscribe()
        try:
            # Yield initial connected event
            yield f"data: {json.dumps({'type': 'CONNECTED'})}\n\n"

            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat comment to keep connection alive through proxies/ngrok
                    yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            event_manager.unsubscribe(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

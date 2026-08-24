import asyncio
import json
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from app.core.events import event_manager

router = APIRouter(prefix="/events", tags=["Realtime Events"])


@router.get("")
async def subscribe_realtime_events(request: Request):
    """Server-Sent Events (SSE) stream with robust client disconnect detection."""

    async def event_generator():
        queue = await event_manager.subscribe()
        try:
            yield f"data: {json.dumps({'type': 'CONNECTED'})}\n\n"

            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        except (asyncio.CancelledError, GeneratorExit):
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

import asyncio
import json
import random
from datetime import datetime
from uuid import UUID

import httpx

from .models import MessagePydantic


def custom_serializer(obj) -> str:
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, UUID):
        return str(obj)
    raise TypeError(f"Type {type(obj)} not serializable")


async def forward_message_to_webhook(*, url: str, message_pydantic: MessagePydantic) -> bool:
    message_pydantic.status = "received"
    try:
        data_dict = json.loads(json.dumps(message_pydantic.dict(), default=custom_serializer))
    except (TypeError, ValueError):
        return False
    try:
        async with httpx.AsyncClient() as client:
            await client.post(url, json=data_dict)
    except httpx.ConnectError:
        return False
    else:
        return True


async def callback_with_updated_status(*, url: str, message_pydantic: MessagePydantic):
    await asyncio.sleep(random.randrange(1, 10))

    message_pydantic.status = "sent"
    data_dict = json.loads(json.dumps(message_pydantic.dict(), default=custom_serializer))

    try:
        async with httpx.AsyncClient() as client:
            await client.post(url, json=data_dict)
    except httpx.ConnectError:
        pass

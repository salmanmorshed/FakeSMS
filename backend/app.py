from typing import Annotated
from fastapi import FastAPI, BackgroundTasks, Body
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from starlette.websockets import WebSocket, WebSocketDisconnect
from tortoise.expressions import Q
from tortoise.contrib.fastapi import register_tortoise


from .config import ConfigDict, get_database_uri, load_config, save_config
from .models import (
    Message,
    MessagePydantic,
    MessageInputPydantic,
    InboxPreviewPydantic,
)
from .wscm import WebSocketConnectionManager
from .utils import forward_message_to_webhook, callback_with_updated_status


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

manager = WebSocketConnectionManager()

config: ConfigDict


@app.on_event("startup")
async def startup_event():
    global config

    config = load_config()


@app.websocket("/ws/{inbox_id}")
async def websocket_endpoint(inbox_id: str, websocket: WebSocket, background_tasks: BackgroundTasks):
    await manager.connect(inbox_id, websocket)
    try:
        while True:
            try:
                data = await manager.receive_json(inbox_id)
            except (KeyError, ValueError):
                continue

            if type(data) is not dict or "type" not in data:
                continue

            if data["type"] == "action:send_message":
                await send_message_view(
                    inbox_id=inbox_id,
                    create_message=MessageInputPydantic(**data["payload"]),
                    background_tasks=background_tasks,
                )

            if data["type"] == "action:delete_conversation":
                await delete_messages_view(inbox_id, data["payload"]["target"])

    except WebSocketDisconnect:
        await manager.disconnect(inbox_id)


@app.get("/")
async def serve_spa_view():
    return FileResponse("./build/frontend/index.html")


@app.get("/api/{inbox_id}/previews")
async def fetch_inbox_previews_view(inbox_id: str):
    distinct_entries = (
        await Message.filter(Q(sender=inbox_id) | Q(recipient=inbox_id)).distinct().values("sender", "recipient")
    )
    numbers = {entry["recipient"] if entry["sender"] == inbox_id else entry["sender"] for entry in distinct_entries}

    results = []
    for number in numbers:
        last_message = (
            await Message.filter(Q(sender=inbox_id, recipient=number) | Q(sender=number, recipient=inbox_id))
            .order_by("-sent_at")
            .limit(1)
            .first()
        )
        preview = InboxPreviewPydantic(
            phone_number=number,
            last_message=last_message.message,
            sent_at=last_message.sent_at,
            direction="incoming" if last_message.sender == number else "outgoing",
        )
        results.append(preview)
    return results


@app.get("/api/{inbox_id}/messages/{target_number}")
async def fetch_messages_view(inbox_id: str, target_number: str):
    return await MessagePydantic.from_queryset(
        Message.filter(
            Q(sender=inbox_id, recipient=target_number) | Q(sender=target_number, recipient=inbox_id)
        ).order_by("sent_at")
    )


@app.delete("/api/{inbox_id}/messages/{target_number}", status_code=204)
async def delete_messages_view(inbox_id: str, target_number: str):
    await Message.filter(
        Q(sender=inbox_id, recipient=target_number) | Q(sender=target_number, recipient=inbox_id)
    ).delete()
    await manager.send_json(inbox_id, {"type": "event:deleted_conversation", "phone_number": target_number})
    await manager.send_json(target_number, {"type": "event:deleted_conversation", "phone_number": inbox_id})


@app.post("/api/{inbox_id}/send", status_code=201)
async def send_message_view(
    inbox_id: str,
    create_message: MessageInputPydantic,
    background_tasks: BackgroundTasks = None,
):
    message = await Message.create(
        sender=inbox_id,
        recipient=create_message.recipient,
        message=create_message.message,
    )
    message_pydantic = await MessagePydantic.from_tortoise_orm(message)

    if message.recipient in config["registered_numbers"]:
        message.webhook_success = await forward_message_to_webhook(
            url=config["webhook_url"], message_pydantic=message_pydantic
        )
        await message.save()
        message_pydantic = await MessagePydantic.from_tortoise_orm(message)

    payload = message_pydantic.dict()
    await manager.send_json(message.recipient, {"type": "event:message_received", "payload": payload})
    await manager.send_json(message.sender, {"type": "event:message_sent", "payload": payload})

    if (
        background_tasks is not None
        and create_message.callback_url is not None
        and message.sender in config["registered_numbers"]
    ):
        background_tasks.add_task(
            callback_with_updated_status,
            url=create_message.callback_url,
            message_pydantic=message_pydantic,
        )

    return message_pydantic


@app.get("/api/config/webhook_url")
async def fetch_webhook_url_view():
    return config["webhook_url"]


@app.put("/api/config/webhook_url")
async def update_webhook_url_view(webhook_url: Annotated[str, Body()]):
    config["webhook_url"] = webhook_url
    save_config(config)
    return config["webhook_url"]


@app.get("/api/config/registered_numbers")
async def fetch_registered_numbers_view():
    return config["registered_numbers"]


@app.put("/api/config/registered_numbers")
async def update_registered_numbers_view(registered_numbers: Annotated[list[str], Body()]):
    config["registered_numbers"] = registered_numbers
    save_config(config)
    return config["registered_numbers"]


register_tortoise(
    app,
    config={
        "connections": {"default": get_database_uri()},
        "apps": {
            "models": {
                "models": ["backend.models"],
                "default_connection": "default",
            }
        },
    },
    generate_schemas=True,
    add_exception_handlers=False,
)

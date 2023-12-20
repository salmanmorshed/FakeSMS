import json
from typing import Dict, Optional

from starlette.websockets import WebSocket
from starlette.exceptions import WebSocketException

from .utils import custom_serializer


class WebSocketConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        if client_id in self.active_connections:
            raise WebSocketException(4000, "Connection already established with another client")
        await websocket.accept()
        self.active_connections[client_id] = websocket

    async def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def receive_message(self, client_id: str) -> Optional[str]:
        return await self.active_connections[client_id].receive_text()

    async def send_message(self, client_id: str, message: str) -> None:
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

    async def broadcast_message(self, message: str) -> None:
        for key in self.active_connections:
            await self.active_connections[key].send_text(message)

    async def receive_json(self, client_id: str) -> dict[any, any]:
        return json.loads(await self.receive_message(client_id))

    async def send_json(self, client_id: str, data: dict[any, any]):
        await self.send_message(client_id, json.dumps(data, default=custom_serializer))

    async def broadcast_json(self, data: dict[any, any]):
        await self.broadcast_message(json.dumps(data, default=custom_serializer))

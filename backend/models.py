from enum import Enum
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field
from tortoise import models, fields
from tortoise.contrib.pydantic import pydantic_model_creator


class Message(models.Model):
    id = fields.UUIDField(pk=True)
    sender = fields.CharField(max_length=32)
    recipient = fields.CharField(max_length=32)
    message = fields.TextField()
    sent_at = fields.DatetimeField(auto_now_add=True)
    webhook_success = fields.BooleanField(null=True)

    def __str__(self):
        return f"Message(from={self.sender}, to={self.recipient}, message={self.message})"


class Direction(str, Enum):
    incoming = "incoming"
    outgoing = "outgoing"


class InboxPreviewPydantic(BaseModel):
    phone_number: str
    direction: Direction
    last_message: str
    sent_at: datetime


class Status(str, Enum):
    pending = "pending"
    sent = "sent"
    received = "received"


class MessagePydantic(pydantic_model_creator(Message, name="Message")):
    status: Status = Field(Status.pending)


class MessageInputPydantic(BaseModel):
    recipient: str
    message: str
    callback_url: Optional[str] = Field(None)


class ConfigPydantic(BaseModel):
    webhook_url: Optional[str] = Field(None)
    registered_numbers: Optional[list[str]] = Field(None)

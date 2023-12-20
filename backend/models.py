from typing import Literal, Optional
from datetime import datetime

from pydantic import BaseModel
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


class InboxPreviewPydantic(BaseModel):
    phone_number: str
    direction: Literal["incoming", "outgoing"]
    last_message: str
    sent_at: datetime


class MessagePydantic(pydantic_model_creator(Message, name="Message")):
    status: str = "pending"


class MessageInputPydantic(BaseModel):
    recipient: str
    message: str
    callback_url: Optional[str] = None

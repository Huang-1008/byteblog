from datetime import datetime
from pydantic import BaseModel


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    content: str
    article_id: int
    user_id: int
    username: str = ""
    created_at: datetime

    model_config = {"from_attributes": True}

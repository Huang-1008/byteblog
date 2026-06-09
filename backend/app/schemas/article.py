from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ArticleCreate(BaseModel):
    title: str
    content_md: str = ""
    summary: str = ""
    cover_url: str = ""
    tag_ids: list[int] = []


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content_md: Optional[str] = None
    summary: Optional[str] = None
    cover_url: Optional[str] = None
    tag_ids: Optional[list[int]] = None


class ArticleStatusUpdate(BaseModel):
    status: str  # draft / pending / published / archived
    review_comment: str = ""


class ArticleResponse(BaseModel):
    id: int
    title: str
    content_md: str
    content_html: str
    summary: str
    cover_url: str
    status: str
    author_id: int
    reviewer_id: Optional[int] = None
    review_comment: str
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    author_name: str = ""
    tags: list["TagResponse"] = []

    model_config = {"from_attributes": True}


class TagResponse(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


class TagWithCount(TagResponse):
    article_count: int = 0

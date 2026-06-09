from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.tag import Tag
from app.models.article_tag import ArticleTag
from app.schemas.article import TagResponse, TagWithCount

router = APIRouter(prefix="/tags", tags=["标签"])


@router.get("", response_model=list[TagWithCount])
def list_tags(db: Session = Depends(get_db)):
    tags = db.query(
        Tag, func.count(ArticleTag.article_id).label("article_count")
    ).outerjoin(ArticleTag, Tag.id == ArticleTag.tag_id).group_by(Tag.id).all()

    return [
        TagWithCount(id=t[0].id, name=t[0].name, slug=t[0].slug, article_count=t[1])
        for t in tags
    ]

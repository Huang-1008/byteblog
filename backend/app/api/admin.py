from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.core.database import get_db
from app.models.article import Article
from app.models.comment import Comment
from app.models.user import User
from app.schemas.article import ArticleResponse, TagResponse
from app.services.auth_deps import get_admin_user, get_current_user

router = APIRouter(prefix="/admin", tags=["管理"])

DRAFT = "draft"
PENDING = "pending"
PUBLISHED = "published"


def article_to_response(article: Article) -> ArticleResponse:
    return ArticleResponse(
        id=article.id,
        title=article.title,
        content_md=article.content_md,
        content_html=article.content_html,
        summary=article.summary,
        cover_url=article.cover_url,
        status=article.status,
        author_id=article.author_id,
        reviewer_id=article.reviewer_id,
        review_comment=article.review_comment,
        published_at=article.published_at,
        created_at=article.created_at,
        updated_at=article.updated_at,
        author_name=article.author.username if article.author else "",
        tags=[TagResponse(id=t.id, name=t.name, slug=t.slug) for t in article.tags],
    )


@router.get("/review/pending", response_model=list[ArticleResponse])
def list_pending_articles(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    articles = (
        db.query(Article)
        .options(joinedload(Article.author), joinedload(Article.tags))
        .filter(Article.status == PENDING)
        .order_by(Article.updated_at.desc())
        .all()
    )
    return [article_to_response(a) for a in articles]


@router.get("/my-dashboard")
def user_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """普通用户个人仪表盘数据"""
    my_articles = db.query(Article).filter(Article.author_id == current_user.id).all()
    my_article_ids = [a.id for a in my_articles]
    recent_comments = []
    if my_article_ids:
        recent_comments = (
            db.query(Comment)
            .options(joinedload(Comment.user), joinedload(Comment.article))
            .filter(Comment.article_id.in_(my_article_ids), Comment.user_id != current_user.id)
            .order_by(Comment.created_at.desc())
            .limit(5)
            .all()
        )
    return {
        "total_articles": len(my_articles),
        "published_count": sum(1 for a in my_articles if a.status == PUBLISHED),
        "draft_count": sum(1 for a in my_articles if a.status == DRAFT),
        "recent_comments": [
            {"id": c.id, "content": c.content[:80], "article_title": c.article.title if c.article else "",
             "username": c.user.username, "created_at": c.created_at.isoformat()}
            for c in recent_comments
        ],
    }


@router.get("/dashboard")
def dashboard(current_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_articles = db.query(func.count(Article.id)).scalar()
    draft_count = db.query(func.count(Article.id)).filter(Article.status == DRAFT).scalar()
    pending_count = db.query(func.count(Article.id)).filter(Article.status == PENDING).scalar()
    published_count = db.query(func.count(Article.id)).filter(Article.status == PUBLISHED).scalar()
    total_comments = db.query(func.count(Comment.id)).scalar()
    total_users = db.query(func.count(User.id)).scalar()

    return {
        "total_articles": total_articles,
        "draft_count": draft_count,
        "pending_count": pending_count,
        "published_count": published_count,
        "total_comments": total_comments,
        "total_users": total_users,
    }


@router.get("/comments/all")
def list_all_comments(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    comments = (
        db.query(Comment)
        .options(joinedload(Comment.user), joinedload(Comment.article))
        .order_by(Comment.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return [
        {
            "id": c.id, "content": c.content, "article_id": c.article_id,
            "article_title": c.article.title if c.article else "",
            "user_id": c.user_id, "username": c.user.username,
            "created_at": c.created_at.isoformat(),
        }
        for c in comments
    ]

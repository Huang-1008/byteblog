from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from markdown_it import MarkdownIt

from app.core.database import get_db
from app.models.article import Article
from app.models.tag import Tag
from app.models.user import User
from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleStatusUpdate, ArticleResponse, TagResponse
from app.services.auth_deps import get_current_user, get_current_user_or_none

router = APIRouter(prefix="/articles", tags=["文章"])
md = MarkdownIt()

# 状态常量
DRAFT = "draft"
PENDING = "pending"
PUBLISHED = "published"
ARCHIVED = "archived"

# 状态流转规则
ALLOWED_TRANSITIONS = {
    DRAFT: [PENDING],
    PENDING: [PUBLISHED, ARCHIVED, DRAFT],
    PUBLISHED: [ARCHIVED],
}


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


# ---- 公开接口 ----

@router.get("", response_model=list[ArticleResponse])
def list_public_articles(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    tag: str = Query(""),
    search: str = Query(""),
    db: Session = Depends(get_db),
):
    query = db.query(Article).options(joinedload(Article.author), joinedload(Article.tags))
    query = query.filter(Article.status == PUBLISHED)

    if tag:
        query = query.join(Article.tags).filter(Tag.slug == tag)
    if search:
        query = query.filter(Article.title.contains(search) | Article.summary.contains(search))

    query = query.order_by(Article.published_at.desc()).offset((page - 1) * size).limit(size)
    return [article_to_response(a) for a in query.all()]


@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_or_none),
):
    article = db.query(Article).options(joinedload(Article.author), joinedload(Article.tags)).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")
    # 未发布文章，仅作者或管理员可查看
    if article.status != PUBLISHED:
        if not current_user:
            raise HTTPException(status_code=404, detail="文章未发布")
        if current_user.id != article.author_id and current_user.role != "admin":
            raise HTTPException(status_code=404, detail="文章未发布")
    return article_to_response(article)


# ---- 登录用户接口 ----

@router.post("", response_model=ArticleResponse, status_code=201)
def create_article(data: ArticleCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    article = Article(
        title=data.title,
        content_md=data.content_md,
        content_html=md.render(data.content_md) if data.content_md else "",
        summary=data.summary,
        cover_url=data.cover_url,
        author_id=current_user.id,
        status=DRAFT,
    )
    if data.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(data.tag_ids)).all()
        article.tags = tags
    db.add(article)
    db.commit()
    db.refresh(article)
    return article_to_response(article)


@router.put("/{article_id}", response_model=ArticleResponse)
def update_article(article_id: int, data: ArticleUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    article = db.query(Article).options(joinedload(Article.author), joinedload(Article.tags)).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")

    if article.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="无权编辑此文章")
    if article.status not in (DRAFT, PUBLISHED):
        raise HTTPException(status_code=403, detail="仅草稿和已发布状态可编辑")

    if data.title is not None:
        article.title = data.title
    if data.content_md is not None:
        article.content_md = data.content_md
        article.content_html = md.render(data.content_md)
    if data.summary is not None:
        article.summary = data.summary
    if data.cover_url is not None:
        article.cover_url = data.cover_url
    if data.tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(data.tag_ids)).all()
        article.tags = tags

    db.commit()
    db.refresh(article)
    return article_to_response(article)


@router.patch("/{article_id}/status", response_model=ArticleResponse)
def change_article_status(
    article_id: int,
    data: ArticleStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    article = db.query(Article).options(joinedload(Article.author), joinedload(Article.tags)).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")

    new_status = data.status
    old_status = article.status

    if new_status not in ALLOWED_TRANSITIONS.get(old_status, []):
        raise HTTPException(status_code=400, detail=f"不能从 {old_status} 转换到 {new_status}")

    # 提交审核权限
    if new_status == PENDING:
        if article.author_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="无权提交审核")

    # 审核权限
    if new_status in [PUBLISHED, DRAFT] and old_status == PENDING:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="需要管理员审核权限")
        article.reviewer_id = current_user.id

    # 驳回理由
    if new_status == DRAFT and old_status == PENDING:
        article.review_comment = data.review_comment

    if new_status == PUBLISHED:
        article.published_at = datetime.now(timezone.utc)

    article.status = new_status
    db.commit()
    db.refresh(article)
    return article_to_response(article)


@router.delete("/{article_id}", status_code=204)
def delete_article(article_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")

    if article.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="无权删除")
    # 管理员可删除任何状态；普通用户仅可删除草稿和已发布
    if current_user.role != "admin" and article.status not in (DRAFT, PUBLISHED):
        raise HTTPException(status_code=403, detail="无法删除此状态的文章")

    db.delete(article)
    db.commit()


# ---- 我的文章列表 ----

@router.get("/my/articles", response_model=list[ArticleResponse])
def list_my_articles(
    status_filter: str = Query(""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Article).options(joinedload(Article.author), joinedload(Article.tags))

    if current_user.role == "admin":
        # 管理员：看所有非草稿文章 + 自己的草稿
        query = query.filter(
            (Article.status != DRAFT) | (Article.author_id == current_user.id)
        )
        if status_filter and status_filter != "all":
            query = query.filter(Article.status == status_filter)
    else:
        # 普通用户：只看自己的文章
        query = query.filter(Article.author_id == current_user.id)
        if status_filter and status_filter != "all":
            query = query.filter(Article.status == status_filter)

    query = query.order_by(Article.updated_at.desc())
    return [article_to_response(a) for a in query.all()]

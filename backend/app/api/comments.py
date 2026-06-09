from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.comment import Comment
from app.models.article import Article
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
from app.services.auth_deps import get_current_user

router = APIRouter(prefix="/comments", tags=["评论"])


@router.get("/articles/{article_id}/comments", response_model=list[CommentResponse])
def list_comments(article_id: int, db: Session = Depends(get_db)):
    comments = (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.article_id == article_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [
        CommentResponse(
            id=c.id, content=c.content, article_id=c.article_id,
            user_id=c.user_id, username=c.user.username, created_at=c.created_at,
        )
        for c in comments
    ]


@router.post("/articles/{article_id}/comments", response_model=CommentResponse, status_code=201)
def create_comment(article_id: int, data: CommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article or article.status != "published":
        raise HTTPException(status_code=404, detail="文章不存在或未发布")

    comment = Comment(content=data.content, article_id=article_id, user_id=current_user.id)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CommentResponse(
        id=comment.id, content=comment.content, article_id=comment.article_id,
        user_id=comment.user_id, username=current_user.username, created_at=comment.created_at,
    )


@router.delete("/{comment_id}", status_code=204)
def delete_comment(comment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="评论不存在")
    if comment.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="无权删除此评论")

    db.delete(comment)
    db.commit()

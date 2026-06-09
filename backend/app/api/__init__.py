from fastapi import APIRouter

from app.api import auth, articles, comments, ai, tags, admin

router = APIRouter(prefix="/api")
router.include_router(auth.router)
router.include_router(articles.router)
router.include_router(comments.router)
router.include_router(ai.router)
router.include_router(tags.router)
router.include_router(admin.router)

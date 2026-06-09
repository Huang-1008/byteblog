from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.ai.deepseek_client import generate_summary, suggest_tags
from app.core.database import get_db
from app.models.ai_log import AiLog
from app.models.user import User
from app.schemas.ai import AiSummaryRequest, AiTagRequest, AiResponse
from app.services.auth_deps import get_current_user

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/generate-summary", response_model=AiResponse)
async def ai_summary(data: AiSummaryRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    summary = await generate_summary(data.content)
    log = AiLog(article_id=0, type="summary", prompt=data.content[:500], result=summary)
    db.add(log)
    db.commit()
    return AiResponse(result=summary)


@router.post("/suggest-tags", response_model=AiResponse)
async def ai_tags(data: AiTagRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tags = await suggest_tags(data.content)
    result = ",".join(tags)
    log = AiLog(article_id=0, type="tag", prompt=data.content[:500], result=result)
    db.add(log)
    db.commit()
    return AiResponse(result=result)

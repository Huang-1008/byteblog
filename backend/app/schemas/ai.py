from pydantic import BaseModel


class AiSummaryRequest(BaseModel):
    content: str


class AiTagRequest(BaseModel):
    content: str


class AiResponse(BaseModel):
    result: str

import json
import httpx

from app.core.config import settings


async def call_deepseek(prompt: str, system_prompt: str = "你是一个专业的编辑助手。") -> str:
    """调用 DeepSeek API 完成对话"""
    if not settings.DEEPSEEK_API_KEY or settings.DEEPSEEK_API_KEY == "your-deepseek-api-key":
        return "[AI 服务未配置，请设置 DEEPSEEK_API_KEY]"

    url = f"{settings.DEEPSEEK_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 500,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


async def generate_summary(content: str) -> str:
    """为文章生成摘要"""
    prompt = (
        "请为以下博客文章生成一段简洁的摘要（100-150字），"
        "概括文章核心观点，使用专业流畅的中文。\n\n"
        f"文章内容：\n{content[:3000]}"
    )
    return await call_deepseek(prompt, "你是一位专业编辑，擅长提炼文章要点。")


async def suggest_tags(content: str) -> list[str]:
    """为文章推荐标签"""
    prompt = (
        "请为以下文章推荐 3-5 个标签。"
        "按 JSON 数组格式返回，每个标签是一个不超过4个字的中文词。"
        "例如：[\"前端开发\", \"Vue\", \"TypeScript\"]\n\n"
        f"文章内容：\n{content[:3000]}"
    )
    result = await call_deepseek(prompt, "你是一个内容分类专家。只返回 JSON 数组，不要其他内容。")
    try:
        # 尝试从返回中提取 JSON 数组
        start = result.find("[")
        end = result.rfind("]") + 1
        if start != -1 and end > start:
            return json.loads(result[start:end])
    except (json.JSONDecodeError, IndexError):
        pass
    return []

from fastapi import APIRouter

from app.api.v2.tasks.llm_query_expansion.political_websearcher import expand_query

router = APIRouter()


@router.post("/query_expansion")
async def query_expansion(query: str):
    return expand_query(query)
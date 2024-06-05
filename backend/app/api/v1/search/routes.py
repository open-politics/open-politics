from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import logging
import json
import requests
from tavily import TavilyClient
from pathlib import Path
from gpt_researcher import GPTResearcher


BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

logging.basicConfig(level=logging.INFO)

router = APIRouter()

@router.get("/get_articles", response_model=None)
async def get_tavily_data(query: str):
    tavily = TavilyClient(api_key="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")
    response = tavily.search(query=query, search_depth="advanced")

    if 'results' in response:
        context = [{"url": obj["url"], "content": obj["content"]} for obj in response['results']]
    else:
        context = []

    return context

@router.get("/report/{query}")
async def get_report(query: str) -> dict:
    report_type = "research_report"
    researcher = GPTResearcher(query, report_type)
    research_result = await researcher.conduct_research()
    report = await researcher.write_report()
    return {"report": report}


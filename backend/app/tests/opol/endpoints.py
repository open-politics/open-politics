from opol import OPOL
from fastapi import APIRouter
import asyncio
import pytest
import os

opol = OPOL(mode=os.getenv("OPOL_MODE"), api_key=os.getenv("OPOL_API_KEY"))

router = APIRouter()

@pytest.fixture
async def articles_by_entity(entity: str):
    articles = opol.entities.by_id(entity)
    return articles

@pytest.fixture
async def articles_by_location(location: str):
    articles = opol.entities.by_location(location)
    return articles

@pytest.mark.asyncio
async def test_articles_by_entity(articles_by_entity):
    entity_id = "14198"
    articles = await articles_by_entity(entity_id)
    # Add assertions here to verify the behavior
    assert articles is not None  # Example assertion

@pytest.mark.asyncio
async def test_articles_by_location(articles_by_location):
    location = "New York"
    articles = await articles_by_location(location)
    # Add assertions here to verify the behavior
    assert articles is not None  # Example assertion

if __name__ == "__main__":
    pytest.main()
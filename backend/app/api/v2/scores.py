import os
from opol import OPOL
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

opol = OPOL(mode=os.getenv("OPOL_MODE"), api_key=os.getenv("OPOL_API_KEY"))

router = APIRouter()

@router.get("/by_entity")
async def get_entity_scores_in_timeframe(
    entity: str,
    timeframe_from: str = "2000-01-01",
    timeframe_to: str = datetime.now().strftime("%Y-%m-%d")
):
    return opol.scores.by_entity(entity, timeframe_from, timeframe_to)


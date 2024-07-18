from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Item, ItemCreate, ItemOut, ItemsOut, ItemUpdate, Message

router = APIRouter()


@router.get('/readiness')
def readyz():
    return {"status": "ok"}, 200


@router.get('/liveness')
def liveness():
    return {"status": "ok"}, 200

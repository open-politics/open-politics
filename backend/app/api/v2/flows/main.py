from fastapi import APIRouter

router = APIRouter()

from .report import router as report_router

router.include_router(report_router, tags=["report"])
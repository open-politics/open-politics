from fastapi import APIRouter

router = APIRouter()

@router.get('/readiness')
def readyz():
    return {"status": "ok"}

@router.get('/liveness')
def liveness():
    return {"status": "ok"}

@router.get('/healthz')
def healthz():
    return {"status": "ok"}
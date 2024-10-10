from fastapi import APIRouter

from app.api.routes import items, login, users, utils, healthcheck
from app.api.v1.locations.routes import router as location_router
from app.api.v1.search.routes import router as search_router


api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(healthcheck.router, prefix="/healthz", tags=["app"])
api_router.include_router(location_router, prefix="/locations", tags=["locations"])
api_router.include_router(search_router, prefix="/search", tags=["search"])


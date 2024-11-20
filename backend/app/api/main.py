from fastapi import APIRouter

from app.api.routes import items, login, users, utils, healthcheck
from app.api.v1.locations.routes import router as location_router
from app.api.v1.search.routes import router as search_router
from app.api.v1.entities.routes import router as entities_router
from app.api.v1.satellite.routes import router as satellite_router
from app.api.routes.search_history import router as search_history_router

# from app.api.v2.satellite.routes import router as satellite_router_v2


# ROuter
api_router = APIRouter()

# V1/ Main APIs
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(healthcheck.router, prefix="/healthz", tags=["app"])
api_router.include_router(location_router, prefix="/locations", tags=["locations"])
api_router.include_router(search_router, prefix="/search", tags=["search"])
api_router.include_router(entities_router, prefix="/entities", tags=["entities"])
api_router.include_router(satellite_router, prefix="/satellite", tags=["satellite"])

## User routes:
api_router.include_router(search_history_router, prefix="/search_histories", tags=["search-history"])


# V2/ Experimental APIs
# api_router.include_router(satellite_router_v2, prefix="/satellite", tags=["satellite"])

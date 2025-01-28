from fastapi import APIRouter

from app.api.routes import items, login, users, utils, healthcheck
from app.api.v1.locations.routes import router as location_router
from app.api.v1.search.routes import router as search_router
from app.api.v1.entities.routes import router as entities_router
from app.api.v1.satellite.routes import router as satellite_router
from app.api.routes.search_history import router as search_history_router
from app.api.routes.workspaces import router as workspaces_router
from app.api.routes.classification_schemes import router as classification_schemes_router

# from app.api.v2.satellite.routes import router as satellite_router_v2
from app.api.v2.geo import router as geo_router
from app.api.v2.articles import router as articles_router
from app.api.v2.classification import router as classification_router
from app.api.v2.entities import router as entities_router
from app.api.v2.tasks.main import router as tasks_router
from app.api.v2.flows.main import router as flows_router
from app.api.v2.scores import router as scores_router
# ROuter
api_router_v1 = APIRouter()
api_router_v2 = APIRouter()

# V1/ Main APIs
api_router_v1.include_router(healthcheck.router, prefix="/healthz", tags=["app"])
api_router_v1.include_router(location_router, prefix="/locations", tags=["locations"])
api_router_v1.include_router(search_router, prefix="/search", tags=["search"])
api_router_v1.include_router(entities_router, prefix="/entities", tags=["entities"])
api_router_v1.include_router(satellite_router, prefix="/satellite", tags=["satellite"])

## User routes:
api_router_v1.include_router(login.router, tags=["login"])
api_router_v1.include_router(users.router, prefix="/users", tags=["users"])
api_router_v1.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router_v1.include_router(items.router, prefix="/items", tags=["items"])
api_router_v1.include_router(search_history_router, prefix="/search_histories", tags=["search-history"])
api_router_v1.include_router(workspaces_router, prefix="/workspaces", tags=["workspaces"])
api_router_v1.include_router(classification_schemes_router, prefix="/classification_schemes", tags=["classification-schemes"])

# V2/ Experimental APIs
# api_router.include_router(satellite_router_v2, prefix="/satellite", tags=["satellite"])
api_router_v2.include_router(geo_router, prefix="/geo", tags=["geo"])
api_router_v2.include_router(articles_router, prefix="/articles", tags=["articles"])
api_router_v2.include_router(classification_router, prefix="/classification", tags=["classification"])
api_router_v2.include_router(entities_router, prefix="/entities", tags=["entities"])
api_router_v2.include_router(flows_router, prefix="/flows", tags=["flows"])
api_router_v2.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
api_router_v2.include_router(scores_router, prefix="/scores", tags=["scores"])
"""
Routers module - API endpoint definitions
"""

from routers.keyword_router import router as keyword_router
from routers.serp_router import router as serp_router
from routers.technical_seo_router import router as technical_seo_router
from routers.seo_optimizer_router import router as seo_optimizer_router

__all__ = ["technical_seo_router", "keyword_router", "serp_router", "seo_optimizer_router"]

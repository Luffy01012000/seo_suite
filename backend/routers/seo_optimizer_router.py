"""
SEO Blog Optimizer Router
Endpoints for analyzing and optimizing blog posts.
"""

from fastapi import APIRouter, HTTPException, status
from schemas.seo_optimizer_schemas import SEOOptimizeRequest, SEOOptimizeResponse
from services.seo_optimizer import get_seo_optimizer_service

router = APIRouter(prefix="/seo", tags=["SEO Blog Optimizer"])


@router.post("/optimize", response_model=SEOOptimizeResponse)
async def optimize_blog_post(request: SEOOptimizeRequest):
    """
    Analyze a blog post and provide SEO recommendations based on:
    - Word count
    - Keyword density
    - Heading hierarchy (H1, H2, H3)
    - Internal linking
    - Image alt text
    """
    try:
        service = get_seo_optimizer_service()
        result = await service.optimize_article(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to optimize article: {str(e)}"
        )

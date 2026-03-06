"""
Technical SEO Audit API Router
Endpoints for comprehensive technical SEO analysis.
"""

import logging

from fastapi import APIRouter, HTTPException, status
from schemas.technical_seo_schemas import (
    QuickAuditRequest,
    QuickAuditResponse,
    TechnicalSEOAuditRequest,
    TechnicalSEOAuditResponse,
)
from services.technical_seo_service import get_technical_seo_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/technical-seo", tags=["Technical SEO Audit"])


@router.post("/audit", response_model=TechnicalSEOAuditResponse)
async def perform_full_audit(request: TechnicalSEOAuditRequest):
    """
    Perform a comprehensive technical SEO audit on any URL.

    This endpoint analyzes:
    - **Title tag** (length, presence)
    - **Meta description** (length, presence)
    - **Heading structure** (H1-H6 hierarchy)
    - **Alt tags** (missing alt text on images)
    - **Canonical tag** (presence, self-referencing)
    - **Robots meta tag** (indexing directives)
    - **Open Graph tags** (social sharing)
    - **Twitter Card tags** (social sharing)
    - **Internal links** (broken links detection)
    - **Image sizes** (dimensions, optimization)
    - **Page load time** (performance)
    - **Structured data** (Schema.org/JSON-LD)
    - **Security** (HTTPS, mixed content)
    - **Mobile-friendly** (viewport)
    - **Language settings** (lang attribute)
    - **URL structure** (SEO-friendly)

    **Example:**
    ```json
    {
        "url": "https://example.com",
        "check_broken_links": true,
        "max_links_to_check": 50
    }
    ```

    Returns a complete audit with scores, issues, and recommendations.
    """
    try:
        service = get_technical_seo_service()
        result = await service.audit_url(request)
        return result

    except Exception as e:
        logger.error(f"Technical SEO audit failed for {request.url}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform audit: {str(e)}",
        )


@router.post("/quick-audit", response_model=QuickAuditResponse)
async def perform_quick_audit(request: QuickAuditRequest):
    """
    Perform a quick lightweight SEO audit (essential checks only).

    This endpoint runs faster by checking only the most critical SEO elements:
    - Title tag
    - Meta description
    - Heading structure
    - Canonical tag
    - Robots meta
    - Alt tags

    **Example:**
    ```json
    {
        "url": "https://example.com"
    }
    ```

    Returns a quick summary with overall score and critical issues.
    """
    try:
        service = get_technical_seo_service()
        result = await service.quick_audit(request)
        return result

    except Exception as e:
        logger.error(f"Quick SEO audit failed for {request.url}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform quick audit: {str(e)}",
        )


@router.get("/audit/{url:path}")
async def audit_url_get(url: str):
    """
    Quick GET endpoint to audit a URL.

    **Example:**
    ```
    GET /api/v1/technical-seo/audit/https://example.com
    ```

    Note: URL must be properly encoded.
    """
    try:
        # Decode URL if needed
        import urllib.parse

        decoded_url = urllib.parse.unquote(url)

        request = TechnicalSEOAuditRequest(
            url=decoded_url,
            check_broken_links=False,  # Faster for GET requests
        )

        service = get_technical_seo_service()
        result = await service.audit_url(request)
        return result

    except Exception as e:
        logger.error(f"Technical SEO audit failed for {url}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform audit: {str(e)}",
        )

from fastapi import APIRouter, HTTPException, status
from schemas.backlink_schemas import BacklinkAnalysisRequest, BacklinkAnalysisResponse
from services.backlink_service import get_backlink_service
from exceptions import SEOServiceError, APIKeyMissingError
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/backlinks", tags=["Backlink Analytics"])


@router.post("/analyze", response_model=BacklinkAnalysisResponse)
async def analyze_backlinks(request: BacklinkAnalysisRequest):
    """
    Analyze backlinks for a given domain or URL.
    
    Returns:
    - Backlink summary (total links, referring domains, AS)
    - Detailed list of backlinks (anchor text, source URL, rank)
    
    **Data Source:**
    - DataForSEO Backlinks API
    """
    try:
        async with get_backlink_service() as service:
            result = await service.analyze_backlinks(request)
            return result
            
    except APIKeyMissingError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"API credentials missing: {str(e)}"
        )
    except SEOServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Backlink service error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error analyzing backlinks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze backlinks: {str(e)}"
        )

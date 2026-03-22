from fastapi import APIRouter, HTTPException, Depends
from schemas.competitor_schemas import CompetitorRequest, CompetitorResponse, DomainIntelligenceResponse
from services.competitor_analyzer import CompetitorAnalyzerService
from services.competitor_labs_service import CompetitorLabsService, get_competitor_labs_service

router = APIRouter()

@router.post("/competitor", response_model=CompetitorResponse)
async def analyze_competitor(request: CompetitorRequest):
    """
    Scrape and analyze a competitor's page against a target keyword.
    """
    try:
        response = await CompetitorAnalyzerService.analyze_competitor_page(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/competitor/domain/{domain}", response_model=DomainIntelligenceResponse)
async def get_domain_intelligence(
    domain: str, 
    service: CompetitorLabsService = Depends(get_competitor_labs_service)
):
    """
    Get SpyFu-like domain intelligence metrics.
    """
    try:
        async with service:
            response = await service.analyze_domain(domain)
            return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch domain intelligence: {str(e)}")

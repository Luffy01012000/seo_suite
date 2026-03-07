from fastapi import APIRouter, HTTPException
from schemas.competitor_schemas import CompetitorRequest, CompetitorResponse
from services.competitor_analyzer import CompetitorAnalyzerService

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

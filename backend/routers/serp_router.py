"""
SERP Analysis API Router
Endpoints for SERP analysis and competitor mining.
"""

from fastapi import APIRouter, HTTPException, status
from schemas.serp_schemas import (
    SERPAnalysisRequest,
    CompetitorAnalysisRequest,
    SERPAnalysisResponse,
    CompetitorAnalysisResponse,
    CompetitorDomain
)
from services.orchestrator import get_keyword_orchestrator
from services.serp_analysis import SERPAnalysisService
from exceptions import SEOServiceError, APIKeyMissingError
from collections import defaultdict
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/serp", tags=["SERP Analysis"])


@router.post("/analyze", response_model=SERPAnalysisResponse)
async def analyze_serp(request: SERPAnalysisRequest):
    """
    Analyze Search Engine Results Page for a keyword.
    
    Returns:
    - Organic search results (top 10)
    - SERP features (featured snippets, PAA, knowledge panel, etc.)
    - People Also Ask questions
    - Related searches
    - AI-powered content gap analysis
    
    **Data Sources:**
    - SERP data: SerpAPI or ValueSERP
    - Content analysis: LangChain + Gemini
    
    **Example:**
    ```json
    {
        "keyword": "best seo tools",
        "language": "en",
        "country": "us",
        "device": "desktop",
        "num_results": 10
    }
    ```
    """
    try:
        orchestrator = get_keyword_orchestrator()
        
        result = await orchestrator.analyze_serp_with_insights(
            keyword=request.keyword,
            language=request.language,
            country=request.country
        )
        
        return result["serp_analysis"]
        
    except APIKeyMissingError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"SERP API key missing: {str(e)}"
        )
    except SEOServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"SERP service error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error analyzing SERP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze SERP"
        )


@router.post("/competitors", response_model=CompetitorAnalysisResponse)
async def analyze_competitors(request: CompetitorAnalysisRequest):
    """
    Mine competitor insights from SERP data.
    
    Analyzes top-ranking domains to identify:
    - Which domains rank multiple times
    - Average ranking positions
    - Common content themes
    - Content gaps and opportunities
    
    **Example:**
    ```json
    {
        "keyword": "content marketing tools",
        "language": "en",
        "country": "us",
        "top_n": 10
    }
    ```
    """
    try:
        # Get SERP data
        async with SERPAnalysisService() as serp_service:
            serp_data = await serp_service.analyze_serp(
                keyword=request.keyword,
                language=request.language,
                country=request.country,
                num_results=request.top_n
            )
        
        # Analyze competitor domains
        domain_stats = defaultdict(lambda: {
            "positions": [],
            "urls": [],
            "titles": [],
            "snippets": []
        })
        
        for result in serp_data.organic_results:
            domain = result.domain
            domain_stats[domain]["positions"].append(result.position)
            domain_stats[domain]["urls"].append(str(result.url))
            domain_stats[domain]["titles"].append(result.title)
            domain_stats[domain]["snippets"].append(result.snippet)
        
        # Create competitor domain objects
        competitors: List[CompetitorDomain] = []
        for domain, stats in domain_stats.items():
            avg_position = sum(stats["positions"]) / len(stats["positions"])
            
            competitors.append(
                CompetitorDomain(
                    domain=domain,
                    ranking_positions=stats["positions"],
                    avg_position=avg_position,
                    num_rankings=len(stats["positions"]),
                    urls=stats["urls"]
                )
            )
        
        # Sort by number of rankings (domains that rank multiple times)
        competitors.sort(key=lambda x: (-x.num_rankings, x.avg_position))
        
        # Extract common SERP features
        common_features = [f.feature_type for f in serp_data.features]
        
        # AI-powered recommendations (if we have organic results)
        recommendations = None
        if serp_data.insights:
            recommendations = serp_data.insights.get("recommended_format", "")
        
        return CompetitorAnalysisResponse(
            keyword=request.keyword,
            total_competitors=len(competitors),
            top_competitors=competitors[:request.top_n],
            common_serp_features=common_features,
            content_gaps=serp_data.insights.get("content_gaps", []) if serp_data.insights else None,
            recommendations=recommendations,
            cached=serp_data.cached
        )
        
    except Exception as e:
        logger.error(f"Error analyzing competitors: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze competitors: {str(e)}"
        )

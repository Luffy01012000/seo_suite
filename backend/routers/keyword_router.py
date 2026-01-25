"""
Keyword Research API Router
Endpoints for keyword suggestions, analysis, and clustering.
"""

from fastapi import APIRouter, HTTPException, status
from schemas.keyword_schemas import (
    KeywordSuggestionRequest,
    KeywordAnalysisRequest,
    KeywordClusterRequest,
    SingleKeywordMetricsRequest,
    KeywordSuggestionsResponse,
    KeywordAnalysisResponse,
    KeywordClusterResponse
)
from services.orchestrator import get_keyword_orchestrator
from services.langchain_analysis import get_langchain_analysis_service
from exceptions import SEOServiceError, APIKeyMissingError, APIRateLimitError
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/keywords", tags=["Keyword Research"])


@router.post("/suggest", response_model=KeywordSuggestionsResponse)
async def get_keyword_suggestions(request: KeywordSuggestionRequest):
    """
    Get keyword suggestions for a seed keyword.
    
    This endpoint fetches related keyword suggestions using free APIs
    and optionally enriches them with search volume and competition data.
    
    **Data Sources:**
    - Keyword suggestions: DataForSEO or Google Autocomplete (fallback)
    - Volume/Competition: Google Ads API (if configured) or estimation
    
    **Example:**
    ```json
    {
        "seed_keyword": "seo tools",
        "limit": 20,
        "language": "en",
        "country": "us"
    }
    ```
    """
    try:
        orchestrator = get_keyword_orchestrator()
        
        result = await orchestrator.get_keyword_suggestions_only(
            seed_keyword=request.seed_keyword,
            language=request.language,
            country=request.country,
            limit=request.limit,
            enrich_with_volume=True
        )
        
        return KeywordSuggestionsResponse(**result)
        
    except APIKeyMissingError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"API key missing or invalid: {str(e)}"
        )
    except APIRateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: {str(e)}"
        )
    except SEOServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in keyword suggestions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.post("/analyze", response_model=KeywordAnalysisResponse)
async def analyze_keywords(request: KeywordAnalysisRequest):
    """
    Complete keyword analysis pipeline.
    
    This is the main endpoint that orchestrates all services:
    1. Fetches keyword suggestions (if enabled)
    2. Enriches with volume/competition data (if enabled)
    3. Analyzes SERP for the seed keyword (if enabled)
    4. Classifies search intent using AI
    5. Clusters keywords into semantic groups (if enabled)
    6. Generates strategic recommendations
    
    **Data Sources:**
    - Free keyword APIs (DataForSEO, Google Autocomplete)
    - Google Ads API (volume/competition)
    - SERP APIs (SerpAPI, ValueSERP)
    - LangChain + Gemini (AI analysis)
    
    **Example:**
    ```json
    {
        "seed_keyword": "content marketing",
        "include_suggestions": true,
        "include_volume": true,
        "include_serp": true,
        "include_clustering": true,
        "limit": 20
    }
    ```
    """
    try:
        orchestrator = get_keyword_orchestrator()
        
        result = await orchestrator.analyze_keyword_complete(
            seed_keyword=request.seed_keyword,
            language=request.language,
            country=request.country,
            limit=request.limit,
            include_suggestions=request.include_suggestions,
            include_volume=request.include_volume,
            include_serp=request.include_serp,
            include_clustering=request.include_clustering
        )
        
        return KeywordAnalysisResponse(**result)
        
    except APIKeyMissingError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"API key missing or invalid: {str(e)}"
        )
    except APIRateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: {str(e)}"
        )
    except SEOServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in keyword analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.post("/cluster", response_model=KeywordClusterResponse)
async def cluster_keywords(request: KeywordClusterRequest):
    """
    Cluster keywords into semantic groups using AI.
    
    This endpoint uses LangChain + Gemini to group keywords based on:
    - Semantic similarity
    - Search intent alignment
    - Topic relevance
    
    **Example:**
    ```json
    {
        "keywords": [
            "seo tools",
            "keyword research tools",
            "backlink checker",
            "rank tracker",
            "content optimization"
        ],
        "num_clusters": 3
    }
    ```
    """
    try:
        from schemas.keyword_schemas import KeywordMetrics
        
        # Convert keyword strings to KeywordMetrics objects
        keyword_metrics = [
            KeywordMetrics(keyword=kw)
            for kw in request.keywords
        ]
        
        # Cluster with AI
        langchain_service = get_langchain_analysis_service()
        clusters = await langchain_service.cluster_keywords(
            keyword_metrics,
            num_clusters=request.num_clusters
        )
        
        # Find unclustered keywords
        clustered_keywords = set()
        for cluster in clusters:
            clustered_keywords.update(cluster.keywords)
        
        unclustered = [
            kw for kw in request.keywords
            if kw not in clustered_keywords
        ]
        
        return KeywordClusterResponse(
            total_keywords=len(request.keywords),
            num_clusters=len(clusters),
            clusters=clusters,
            unclustered_keywords=unclustered if unclustered else None
        )
        
    except Exception as e:
        logger.error(f"Error clustering keywords: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cluster keywords: {str(e)}"
        )


@router.get("/{keyword}/metrics")
async def get_keyword_metrics(
    keyword: str,
    language: str = "en",
    country: str = "us"
):
    """
    Get detailed metrics for a single keyword.
    
    Returns volume, competition, intent, difficulty, and SERP analysis.
    
    **Example:**
    ```
    GET /api/v1/keywords/seo%20tools/metrics?language=en&country=us
    ```
    """
    try:
        orchestrator = get_keyword_orchestrator()
        
        # Analyze single keyword
        result = await orchestrator.analyze_keyword_complete(
            seed_keyword=keyword,
            language=language,
            country=country,
            include_suggestions=False,
            include_volume=True,
            include_serp=True,
            include_clustering=False
        )
        
        # Return just the keyword metrics
        if result["keywords"]:
            return result["keywords"][0]
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Keyword metrics not found"
            )
        
    except Exception as e:
        logger.error(f"Error fetching keyword metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch metrics: {str(e)}"
        )

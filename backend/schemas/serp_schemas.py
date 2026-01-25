from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from enum import Enum


class SERPFeatureType(str, Enum):
    """Types of SERP features"""
    FEATURED_SNIPPET = "featured_snippet"
    PEOPLE_ALSO_ASK = "people_also_ask"
    KNOWLEDGE_PANEL = "knowledge_panel"
    LOCAL_PACK = "local_pack"
    IMAGE_PACK = "image_pack"
    VIDEO_CAROUSEL = "video_carousel"
    TOP_STORIES = "top_stories"
    RELATED_SEARCHES = "related_searches"
    SITE_LINKS = "site_links"
    SHOPPING = "shopping"


# ============= Request Schemas =============

class SERPAnalysisRequest(BaseModel):
    """Request for SERP analysis"""
    keyword: str = Field(..., min_length=1, max_length=200)
    language: str = Field("en", description="Language code")
    country: str = Field("us", description="Country code")
    device: str = Field("desktop", description="Device type: desktop, mobile, tablet")
    num_results: int = Field(10, ge=1, le=100, description="Number of organic results to fetch")


class CompetitorAnalysisRequest(BaseModel):
    """Request for competitor mining"""
    keyword: str = Field(..., min_length=1, max_length=200)
    language: str = Field("en")
    country: str = Field("us")
    top_n: int = Field(10, ge=1, le=20, description="Number of top competitors to analyze")


# ============= Response Schemas =============

class OrganicResult(BaseModel):
    """Individual organic search result"""
    position: int
    title: str
    url: HttpUrl
    displayed_url: str
    snippet: str
    domain: str
    
    # Optional rich data
    date: Optional[str] = None
    rich_snippet: Optional[Dict[str, Any]] = None
    sitelinks: Optional[List[Dict[str, str]]] = None


class SERPFeature(BaseModel):
    """SERP feature data"""
    feature_type: SERPFeatureType
    title: Optional[str] = None
    snippet: Optional[str] = None
    source_url: Optional[HttpUrl] = None
    source_domain: Optional[str] = None
    data: Optional[Dict[str, Any]] = Field(None, description="Additional feature-specific data")


class PeopleAlsoAsk(BaseModel):
    """People Also Ask question"""
    question: str
    answer: Optional[str] = None
    source_url: Optional[HttpUrl] = None
    source_domain: Optional[str] = None


class RelatedSearch(BaseModel):
    """Related search suggestion"""
    keyword: str
    search_volume: Optional[int] = None


class SERPAnalysisResponse(BaseModel):
    """Complete SERP analysis response"""
    keyword: str
    total_results: int
    
    # Core results
    organic_results: List[OrganicResult]
    
    # SERP features
    features: List[SERPFeature] = []
    people_also_ask: List[PeopleAlsoAsk] = []
    related_searches: List[RelatedSearch] = []
    
    # Meta info
    serp_api_used: str
    cached: bool = False
    
    # AI insights (populated by LangChain)
    insights: Optional[Dict[str, Any]] = Field(None, description="AI-generated SERP insights")


class CompetitorDomain(BaseModel):
    """Competitor domain analysis"""
    domain: str
    ranking_positions: List[int] = Field(..., description="All positions this domain ranks for in top N")
    avg_position: float
    num_rankings: int
    urls: List[str] = Field(..., description="URLs ranking in top results")
    
    # Content analysis (extracted from snippets/titles)
    common_themes: Optional[List[str]] = None
    content_types: Optional[List[str]] = None  # e.g., "blog", "product", "landing"
    
    # Estimated metrics
    estimated_traffic: Optional[int] = None


class CompetitorAnalysisResponse(BaseModel):
    """Competitor mining response"""
    keyword: str
    total_competitors: int
    top_competitors: List[CompetitorDomain]
    
    # Aggregate insights
    avg_content_length: Optional[int] = None
    common_serp_features: List[SERPFeatureType] = []
    content_gaps: Optional[List[str]] = Field(None, description="AI-identified content opportunities")
    
    # Strategic recommendations
    recommendations: Optional[str] = Field(None, description="AI-generated competitive strategy")
    
    cached: bool = False

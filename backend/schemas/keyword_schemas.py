from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class SearchIntent(str, Enum):
    """Keyword search intent classification"""
    INFORMATIONAL = "informational"
    COMMERCIAL = "commercial"
    TRANSACTIONAL = "transactional"
    NAVIGATIONAL = "navigational"
    UNKNOWN = "unknown"


class DifficultyLevel(str, Enum):
    """Keyword difficulty classification"""
    VERY_EASY = "very_easy"
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    VERY_HARD = "very_hard"


class CompetitionLevel(str, Enum):
    """Google Ads competition level"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    UNKNOWN = "unknown"


# ============= Request Schemas =============

class KeywordSuggestionRequest(BaseModel):
    """Request for keyword suggestions"""
    seed_keyword: str = Field(..., min_length=1, max_length=200, description="Seed keyword to generate suggestions from")
    limit: int = Field(20, ge=1, le=100, description="Maximum number of suggestions to return")
    language: str = Field("en", description="Language code (ISO 639-1)")
    country: str = Field("us", description="Country code (ISO 3166-1 alpha-2)")


class KeywordAnalysisRequest(BaseModel):
    """Request for full keyword analysis pipeline"""
    seed_keyword: str = Field(..., min_length=1, max_length=200, description="Seed keyword to analyze")
    include_suggestions: bool = Field(True, description="Include related keyword suggestions")
    include_volume: bool = Field(True, description="Include search volume data")
    include_serp: bool = Field(True, description="Include SERP analysis")
    include_clustering: bool = Field(True, description="Include AI-powered clustering")
    language: str = Field("en", description="Language code")
    country: str = Field("us", description="Country code")
    limit: int = Field(20, ge=1, le=100, description="Max suggestions")


class KeywordClusterRequest(BaseModel):
    """Request for keyword clustering"""
    keywords: List[str] = Field(..., min_items=2, max_items=200, description="Keywords to cluster")
    num_clusters: Optional[int] = Field(None, ge=2, le=20, description="Number of clusters (auto if None)")


class SingleKeywordMetricsRequest(BaseModel):
    """Request for detailed metrics on a single keyword"""
    keyword: str = Field(..., min_length=1, max_length=200)
    language: str = Field("en")
    country: str = Field("us")


# ============= Response Schemas =============

class KeywordSuggestion(BaseModel):
    """Individual keyword suggestion with basic metrics"""
    keyword: str
    search_volume: Optional[int] = None
    competition: Optional[CompetitionLevel] = CompetitionLevel.UNKNOWN
    competition_score: Optional[float] = Field(None, ge=0, le=1, description="0-1 normalized competition score")
    cpc: Optional[float] = Field(None, ge=0, description="Cost per click in USD")
    trend: Optional[str] = None  # e.g., "rising", "stable", "falling"
    source: str = Field("api", description="Data source (api, google_ads, etc.)")


class KeywordMetrics(BaseModel):
    """Detailed metrics for a keyword"""
    keyword: str
    search_volume: Optional[int] = None
    competition: Optional[CompetitionLevel] = CompetitionLevel.UNKNOWN
    competition_score: Optional[float] = None
    cpc: Optional[float] = None
    
    # AI-powered analysis
    intent: Optional[SearchIntent] = SearchIntent.UNKNOWN
    difficulty: Optional[DifficultyLevel] = None
    difficulty_score: Optional[float] = Field(None, ge=0, le=100)
    
    # Additional insights
    trending: Optional[bool] = None
    seasonality: Optional[str] = None
    related_keywords: Optional[List[str]] = []


class KeywordCluster(BaseModel):
    """A group of semantically related keywords"""
    cluster_id: int
    cluster_name: str = Field(..., description="AI-generated cluster theme/topic")
    primary_keyword: str = Field(..., description="Main keyword representing the cluster")
    keywords: List[str] = Field(..., min_items=1)
    intent: Optional[SearchIntent] = SearchIntent.UNKNOWN
    avg_search_volume: Optional[int] = None
    recommendation: Optional[str] = Field(None, description="Strategic content recommendation")


class KeywordSuggestionsResponse(BaseModel):
    """Response containing keyword suggestions"""
    seed_keyword: str
    total_suggestions: int
    suggestions: List[KeywordSuggestion]
    data_sources: List[str] = Field(..., description="APIs used to fetch data")
    cached: bool = Field(False, description="Whether results were cached")


class KeywordAnalysisResponse(BaseModel):
    """Complete keyword analysis response"""
    seed_keyword: str
    keywords: List[KeywordMetrics]
    clusters: Optional[List[KeywordCluster]] = None
    insights: Optional[Dict[str, Any]] = Field(None, description="AI-generated insights and recommendations")
    total_keywords: int
    data_sources: List[str]
    cached: bool = False


class KeywordClusterResponse(BaseModel):
    """Response for keyword clustering"""
    total_keywords: int
    num_clusters: int
    clusters: List[KeywordCluster]
    unclustered_keywords: Optional[List[str]] = Field(None, description="Keywords that didn't fit any cluster")

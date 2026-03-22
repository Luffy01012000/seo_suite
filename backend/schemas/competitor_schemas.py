from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Optional, Any

class CompetitorRequest(BaseModel):
    keyword: str
    competitor_url: HttpUrl

class CompetitorMetrics(BaseModel):
    word_count: int
    h1_count: int
    h2_count: int
    keyword_density: float
    images_count: int
    images_without_alt: int
    internal_links: int
    external_links: int

class CompetitorResponse(BaseModel):
    url: str
    keyword: str
    metrics: CompetitorMetrics
    insights: List[str]

# --- Domain Overview & Competitor Intelligence Hub ---

class DomainOverview(BaseModel):
    domain: str
    organic_keywords: int = 0
    organic_traffic: int = 0
    organic_cost: float = 0.0
    paid_keywords: int = 0
    paid_traffic: int = 0
    paid_cost: float = 0.0
    rank: int = 0
    historical_data: List[Dict[str, Any]] = []

class RankedKeyword(BaseModel):
    keyword: str
    rank: int
    search_volume: int = 0
    cpc: float = 0.0
    traffic_est: int = 0
    url: Optional[str] = None

class DomainCompetitor(BaseModel):
    domain: str
    shared_keywords: int = 0
    common_keywords_count: int = 0
    relevance: float = 0.0
    organic_traffic_est: int = 0

class DomainIntelligenceResponse(BaseModel):
    target: str
    overview: DomainOverview
    top_keywords: List[RankedKeyword] = []
    top_competitors: List[DomainCompetitor] = []
    data_source: str = "dataforseo"

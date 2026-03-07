from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Optional

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

from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any


# ============= Request Schemas =============

class BacklinkAnalysisRequest(BaseModel):
    """Request for backlink analysis"""
    target: str = Field(..., description="Domain or URL to analyze (e.g., 'example.com' or 'https://example.com/page')")
    mode: str = Field("domain", description="Analysis mode: 'domain', 'subdomain', or 'url'")
    limit: int = Field(100, ge=1, le=1000, description="Number of backlinks to fetch")


# ============= Response Schemas =============

class BacklinkItem(BaseModel):
    """Individual backlink detail"""
    url_from: str = Field(..., description="The page where the link is found")
    url_to: str = Field(..., description="The page the link points to")
    title: Optional[str] = Field(None, description="Title of the source page")
    anchor: Optional[str] = Field(None, description="Anchor text of the link")
    rank: Optional[int] = Field(None, description="Authority score or rank of the source page (0-100)")
    is_dofollow: bool = Field(True, description="Whether the link is Dofollow")
    first_seen: Optional[str] = Field(None, description="Date when the link was first discovered")
    last_seen: Optional[str] = Field(None, description="Date when the link was last seen")
    is_broken: bool = Field(False, description="Whether the link is currently broken")


class BacklinkSummary(BaseModel):
    """Aggregated backlink statistics"""
    total_backlinks: int = Field(0, description="Total number of backlinks found")
    referring_domains: int = Field(0, description="Total number of unique referring domains")
    referring_main_domains: int = Field(0, description="Total number of unique referring main domains")
    referring_ips: int = Field(0, description="Total number of unique referring IP addresses")
    referring_subnets: int = Field(0, description="Total number of unique referring subnets")
    dofollow_percent: float = Field(0.0, description="Percentage of Dofollow links")
    rank: int = Field(0, description="Overall authority score of the target (0-100)")


class BacklinkAnalysisResponse(BaseModel):
    """Complete backlink analysis response"""
    target: str
    summary: BacklinkSummary
    backlinks: List[BacklinkItem]
    cached: bool = False
    data_source: str = "dataforseo"

"""
SEO Blog Optimizer Schemas
Pydantic models for SEO blog optimization requests and responses.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class SEOOptimizeRequest(BaseModel):
    """Request for SEO blog optimization"""

    article: str = Field(..., description="The article content (HTML or plain text)")
    keyword: str = Field(..., description="The target keyword to optimize for")
    title: Optional[str] = Field(None, description="The article title")
    meta_description: Optional[str] = Field(None, description="The meta description")


class SEOMetrics(BaseModel):
    """SEO metrics for the article"""

    word_count: int = Field(0, description="Total number of words")
    keyword_density: float = Field(0.0, description="Keyword density percentage")
    h1_count: int = Field(0, description="Number of H1 tags")
    h2_count: int = Field(0, description="Number of H2 tags")
    h3_count: int = Field(0, description="Number of H3 tags")
    internal_links: int = Field(0, description="Number of internal links")
    images: int = Field(0, description="Total number of images")
    images_without_alt: int = Field(0, description="Number of images missing alt text")


class SEOOptimizeResponse(BaseModel):
    """SEO optimization analysis response"""

    seo_score: int = Field(..., ge=0, le=100, description="Overall SEO score 0-100")
    metrics: SEOMetrics
    recommendations: List[str] = Field(default_factory=list, description="SEO improvement suggestions")
    ai_insights: Optional[str] = Field(None, description="Qualitative AI-powered analysis and content suggestions")


from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class ContentType(str, Enum):
    WEBSITE = "website"
    PRODUCT = "product"


class SEOResponse(BaseModel):
    product_description: str
    seo_title: str
    meta_description: str
    bullet_features: List[str]

class WebsiteSEOResponse(BaseModel):
    page_summary: str
    seo_title: str
    meta_description: str
    suggested_keywords: List[str]
    content_strategy: str

class WebsiteContentRequest(BaseModel):
    url: str
    prompt: Optional[str] = None


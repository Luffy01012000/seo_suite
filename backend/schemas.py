from pydantic import BaseModel
from typing import List

class SEOResponse(BaseModel):
    product_description: str
    seo_title: str
    meta_description: str
    bullet_features: List[str]

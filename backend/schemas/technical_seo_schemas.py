"""
Technical SEO Audit Schemas
Pydantic models for technical SEO audit requests and responses.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, HttpUrl


class SEOStatus(str, Enum):
    """SEO check status"""

    PASS = "pass"
    WARNING = "warning"
    ERROR = "error"
    INFO = "info"


class TitleTagCheck(BaseModel):
    """Title tag analysis result"""

    content: Optional[str] = Field(None, description="The title tag content")
    length: int = Field(0, description="Character count of the title")
    status: SEOStatus = Field(..., description="SEO status based on length")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class MetaDescriptionCheck(BaseModel):
    """Meta description analysis result"""

    content: Optional[str] = Field(None, description="The meta description content")
    length: int = Field(0, description="Character count")
    status: SEOStatus = Field(
        ..., description="SEO status based on length and presence"
    )
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class HeadingStructure(BaseModel):
    """Single heading element"""

    tag: str = Field(..., description="H1, H2, H3, etc.")
    text: str = Field(..., description="Heading text content")
    order: int = Field(..., description="Position in document")


class HeadingStructureCheck(BaseModel):
    """H1/H2 structure analysis"""

    h1_count: int = Field(0, description="Number of H1 tags")
    h2_count: int = Field(0, description="Number of H2 tags")
    h3_count: int = Field(0, description="Number of H3 tags")
    h4_count: int = Field(0, description="Number of H4 tags")
    h5_count: int = Field(0, description="Number of H5 tags")
    h6_count: int = Field(0, description="Number of H6 tags")
    headings: List[HeadingStructure] = Field(
        default_factory=list, description="All headings found"
    )
    has_multiple_h1: bool = Field(False, description="Multiple H1 tags warning")
    hierarchy_issues: List[str] = Field(
        default_factory=list, description="Hierarchy problems found"
    )
    status: SEOStatus = Field(..., description="Overall heading structure status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class ImageWithoutAlt(BaseModel):
    """Image missing alt text"""

    src: str = Field(..., description="Image source URL")
    tag_type: str = Field("img", description="Type of image tag")
    context: Optional[str] = Field(None, description="Surrounding context")


class AltTagCheck(BaseModel):
    """Alt tag analysis result"""

    total_images: int = Field(0, description="Total number of images")
    images_with_alt: int = Field(0, description="Images with alt text")
    images_without_alt: int = Field(0, description="Images missing alt text")
    missing_alt_images: List[ImageWithoutAlt] = Field(
        default_factory=list, description="Images without alt text details"
    )
    status: SEOStatus = Field(..., description="Overall alt tag status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class CanonicalTagCheck(BaseModel):
    """Canonical tag analysis"""

    present: bool = Field(False, description="Whether canonical tag exists")
    href: Optional[str] = Field(None, description="Canonical URL")
    is_self_referencing: Optional[bool] = Field(
        None, description="Whether it points to itself"
    )
    status: SEOStatus = Field(..., description="Canonical tag status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class RobotsMetaCheck(BaseModel):
    """Robots meta tag analysis"""

    present: bool = Field(False, description="Whether robots meta tag exists")
    content: Optional[str] = Field(None, description="Robots directive content")
    noindex: bool = Field(False, description="Page has noindex directive")
    nofollow: bool = Field(False, description="Page has nofollow directive")
    status: SEOStatus = Field(..., description="Robots meta status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class OpenGraphTag(BaseModel):
    """Individual Open Graph tag"""

    property: str = Field(..., description="OG property name")
    content: str = Field(..., description="OG property content")


class OpenGraphCheck(BaseModel):
    """Open Graph tags analysis"""

    present: bool = Field(False, description="Whether any OG tags exist")
    tags: List[OpenGraphTag] = Field(
        default_factory=list, description="All OG tags found"
    )
    has_og_title: bool = Field(False, description="Has og:title")
    has_og_description: bool = Field(False, description="Has og:description")
    has_og_image: bool = Field(False, description="Has og:image")
    has_og_url: bool = Field(False, description="Has og:url")
    has_og_type: bool = Field(False, description="Has og:type")
    missing_essential: List[str] = Field(
        default_factory=list, description="Missing essential OG tags"
    )
    status: SEOStatus = Field(..., description="OG tags status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class TwitterCardTag(BaseModel):
    """Individual Twitter Card tag"""

    name: str = Field(..., description="Twitter card property name")
    content: str = Field(..., description="Twitter card property content")


class TwitterCardCheck(BaseModel):
    """Twitter Card tags analysis"""

    present: bool = Field(False, description="Whether any Twitter card tags exist")
    tags: List[TwitterCardTag] = Field(
        default_factory=list, description="All Twitter card tags found"
    )
    has_card: bool = Field(False, description="Has twitter:card")
    has_title: bool = Field(False, description="Has twitter:title")
    has_description: bool = Field(False, description="Has twitter:description")
    has_image: bool = Field(False, description="Has twitter:image")
    status: SEOStatus = Field(..., description="Twitter card status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class BrokenLink(BaseModel):
    """Broken internal link"""

    url: str = Field(..., description="The broken URL")
    anchor_text: Optional[str] = Field(None, description="Link anchor text")
    status_code: Optional[int] = Field(None, description="HTTP status code returned")
    error: Optional[str] = Field(None, description="Error message if any")


class InternalLinksCheck(BaseModel):
    """Internal links analysis"""

    total_internal_links: int = Field(0, description="Total internal links found")
    unique_internal_links: int = Field(0, description="Unique internal links")
    broken_links: List[BrokenLink] = Field(
        default_factory=list, description="Broken internal links"
    )
    status: SEOStatus = Field(..., description="Internal links status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class ImageSizeIssue(BaseModel):
    """Image with size issues"""

    src: str = Field(..., description="Image source URL")
    width: Optional[int] = Field(None, description="Image width in pixels")
    height: Optional[int] = Field(None, description="Image height in pixels")
    file_size_kb: Optional[float] = Field(
        None, description="File size in KB if available"
    )
    issue: str = Field(..., description="Description of the size issue")


class ImageSizeCheck(BaseModel):
    """Image size analysis"""

    total_images: int = Field(0, description="Total images analyzed")
    oversized_images: List[ImageSizeIssue] = Field(
        default_factory=list, description="Images that are too large"
    )
    images_without_dimensions: List[str] = Field(
        default_factory=list, description="Images missing width/height attributes"
    )
    status: SEOStatus = Field(..., description="Image size status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class PageLoadTimeCheck(BaseModel):
    """Page load time analysis"""

    load_time_seconds: float = Field(..., description="Total page load time in seconds")
    status: SEOStatus = Field(..., description="Load time status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )
    metrics: Optional[Dict[str, Any]] = Field(
        None, description="Additional performance metrics"
    )


class StructuredDataCheck(BaseModel):
    """Structured data / Schema.org analysis"""

    present: bool = Field(False, description="Whether structured data exists")
    types: List[str] = Field(
        default_factory=list, description="Schema types found (JSON-LD)"
    )
    json_ld_scripts: List[str] = Field(
        default_factory=list, description="JSON-LD script contents"
    )
    microdata_count: int = Field(0, description="Microdata items count")
    rdfa_count: int = Field(0, description="RDFa items count")
    status: SEOStatus = Field(..., description="Structured data status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class SecurityCheck(BaseModel):
    """Basic security checks"""

    is_https: bool = Field(False, description="Whether page uses HTTPS")
    mixed_content: bool = Field(False, description="Mixed HTTP/HTTPS content detected")
    status: SEOStatus = Field(..., description="Security status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class MobileFriendlyCheck(BaseModel):
    """Mobile-friendly indicators"""

    viewport_meta: bool = Field(False, description="Viewport meta tag present")
    media_queries_detected: bool = Field(
        False, description="CSS media queries detected"
    )
    status: SEOStatus = Field(..., description="Mobile-friendly status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class MetaCharsetCheck(BaseModel):
    """Charset meta tag check"""

    present: bool = Field(False, description="Charset meta tag exists")
    charset: Optional[str] = Field(None, description="Charset value (e.g., UTF-8)")
    status: SEOStatus = Field(..., description="Charset status")


class ViewportCheck(BaseModel):
    """Viewport meta tag check"""

    present: bool = Field(False, description="Viewport meta tag exists")
    content: Optional[str] = Field(None, description="Viewport content")
    status: SEOStatus = Field(..., description="Viewport status")


class LanguageCheck(BaseModel):
    """HTML lang attribute check"""

    lang_attribute: Optional[str] = Field(None, description="HTML lang attribute value")
    hreflang_tags: List[Dict[str, str]] = Field(
        default_factory=list, description="Hreflang tags found"
    )
    status: SEOStatus = Field(..., description="Language status")
    recommendations: List[str] = Field(
        default_factory=list, description="Improvement suggestions"
    )


class URLStructureCheck(BaseModel):
    """URL structure analysis"""

    url: str = Field(..., description="The analyzed URL")
    is_seo_friendly: bool = Field(True, description="Whether URL is SEO friendly")
    has_underscores: bool = Field(False, description="URL contains underscores")
    has_uppercase: bool = Field(False, description="URL contains uppercase letters")
    has_special_chars: bool = Field(
        False, description="URL has unnecessary special characters"
    )
    issues: List[str] = Field(default_factory=list, description="URL structure issues")
    status: SEOStatus = Field(..., description="URL structure status")


# ============= Request/Response Schemas =============


class TechnicalSEOAuditRequest(BaseModel):
    """Request for technical SEO audit"""

    url: str = Field(..., description="URL to audit")
    user_agent: str = Field(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0",
        description="User agent string for fetching",
    )
    check_broken_links: bool = Field(
        True, description="Whether to check for broken links"
    )
    max_links_to_check: int = Field(
        50, ge=1, le=100, description="Maximum links to check for broken status"
    )
    timeout_seconds: int = Field(
        30, ge=5, le=120, description="Request timeout in seconds"
    )
    follow_redirects: bool = Field(True, description="Whether to follow redirects")


class TechnicalSEOAuditResponse(BaseModel):
    """Complete technical SEO audit response"""

    url: str = Field(..., description="Audited URL")
    final_url: Optional[str] = Field(None, description="Final URL after redirects")
    audit_timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Audit timestamp"
    )

    # Core SEO Elements
    title_tag: TitleTagCheck
    meta_description: MetaDescriptionCheck
    headings: HeadingStructureCheck

    # Technical Elements
    canonical_tag: CanonicalTagCheck
    robots_meta: RobotsMetaCheck
    open_graph: OpenGraphCheck
    twitter_cards: TwitterCardCheck

    # Content Analysis
    alt_tags: AltTagCheck
    images: ImageSizeCheck

    # Links
    internal_links: InternalLinksCheck

    # Performance
    page_load_time: PageLoadTimeCheck

    # Additional Checks
    structured_data: StructuredDataCheck
    security: SecurityCheck
    mobile_friendly: MobileFriendlyCheck
    charset: MetaCharsetCheck
    viewport: ViewportCheck
    language: LanguageCheck
    url_structure: URLStructureCheck

    # Summary
    overall_score: int = Field(..., ge=0, le=100, description="Overall SEO score 0-100")
    critical_issues: List[str] = Field(
        default_factory=list,
        description="Critical issues requiring immediate attention",
    )
    warnings: List[str] = Field(default_factory=list, description="Warnings to address")
    passed_checks: int = Field(0, description="Number of checks passed")
    total_checks: int = Field(0, description="Total checks performed")

    # Metadata
    http_status: int = Field(200, description="HTTP status code")
    content_type: Optional[str] = Field(None, description="Content-Type header")
    server: Optional[str] = Field(None, description="Server header")
    html_size_kb: Optional[float] = Field(None, description="HTML document size in KB")


class QuickAuditRequest(BaseModel):
    """Request for quick technical SEO audit (lightweight)"""

    url: str = Field(..., description="URL to audit")
    timeout_seconds: int = Field(
        15, ge=5, le=60, description="Request timeout in seconds"
    )


class QuickAuditResponse(BaseModel):
    """Quick audit response with essential checks only"""

    url: str
    audit_timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Essential checks only
    title_tag: TitleTagCheck
    meta_description: MetaDescriptionCheck
    headings: HeadingStructureCheck
    canonical_tag: CanonicalTagCheck
    robots_meta: RobotsMetaCheck
    alt_tags: AltTagCheck

    overall_score: int = Field(..., ge=0, le=100)
    critical_issues: List[str] = Field(default_factory=list)

    http_status: int = Field(200)
    page_load_time_seconds: Optional[float] = Field(None)


class AuditHistoryRequest(BaseModel):
    """Request to fetch audit history for a URL"""

    url: str
    limit: int = Field(10, ge=1, le=100)


class AuditHistoryResponse(BaseModel):
    """Audit history response"""

    url: str
    total_audits: int
    audits: List[TechnicalSEOAuditResponse]

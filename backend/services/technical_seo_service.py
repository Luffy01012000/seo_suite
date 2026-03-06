"""
Technical SEO Audit Service
Performs comprehensive technical SEO analysis on web pages.
"""

import logging
import re
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urljoin, urlparse, urlunparse

import httpx
import asyncio
from bs4 import BeautifulSoup
from pydantic import HttpUrl
from schemas.technical_seo_schemas import (
    AltTagCheck,
    BrokenLink,
    CanonicalTagCheck,
    HeadingStructure,
    HeadingStructureCheck,
    ImageSizeCheck,
    ImageSizeIssue,
    ImageWithoutAlt,
    InternalLinksCheck,
    LanguageCheck,
    MetaCharsetCheck,
    MetaDescriptionCheck,
    MobileFriendlyCheck,
    OpenGraphCheck,
    OpenGraphTag,
    PageLoadTimeCheck,
    QuickAuditRequest,
    QuickAuditResponse,
    RobotsMetaCheck,
    SecurityCheck,
    SEOStatus,
    StructuredDataCheck,
    TechnicalSEOAuditRequest,
    TechnicalSEOAuditResponse,
    TitleTagCheck,
    TwitterCardCheck,
    TwitterCardTag,
    URLStructureCheck,
    ViewportCheck,
)

logger = logging.getLogger(__name__)


@dataclass
class PageData:
    """Container for fetched page data"""

    url: str
    final_url: str
    html: str
    soup: BeautifulSoup
    headers: Dict[str, str]
    status_code: int
    load_time: float
    content_size: int


class TechnicalSEOService:
    """
    Service for performing technical SEO audits.
    Fetches page HTML and analyzes various SEO elements.
    """

    # SEO Best Practice Constants
    TITLE_MIN_LENGTH = 30
    TITLE_MAX_LENGTH = 60
    TITLE_OPTIMAL_MAX = 55
    META_DESC_MIN_LENGTH = 50
    META_DESC_MAX_LENGTH = 160
    META_DESC_OPTIMAL_MAX = 155
    MAX_IMAGE_SIZE_KB = 500  # Images larger than 500KB are flagged
    CRITICAL_LOAD_TIME = 3.0  # seconds

    def __init__(self):
        # We'll create the httpx AsyncClient instances per request or manage them differently,
        # but for simplicity, we can just use httpx.AsyncClient as an async context manager
        # inside the fetch methods, or we can configure default headers here to be used later.
        self.default_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    async def audit_url(
        self, request: TechnicalSEOAuditRequest
    ) -> TechnicalSEOAuditResponse:
        """
        Perform a complete technical SEO audit on a URL.

        Args:
            request: TechnicalSEOAuditRequest with URL and options

        Returns:
            TechnicalSEOAuditResponse with complete analysis
        """
        start_time = time.time()

        # Fetch the page
        page_data = await self._fetch_page(request)

        # Run all checks
        title_check = self._check_title_tag(page_data)
        meta_desc_check = self._check_meta_description(page_data)
        headings_check = self._check_headings(page_data)
        alt_tags_check = self._check_alt_tags(page_data)
        canonical_check = self._check_canonical(page_data)
        robots_check = self._check_robots_meta(page_data)
        og_check = self._check_open_graph(page_data)
        twitter_check = self._check_twitter_cards(page_data)
        links_check = await self._check_internal_links(page_data, request)
        image_size_check = await self._check_image_sizes(page_data)
        structured_data_check = self._check_structured_data(page_data)
        security_check = self._check_security(page_data)
        mobile_check = self._check_mobile_friendly(page_data)
        charset_check = self._check_charset(page_data)
        viewport_check = self._check_viewport(page_data)
        language_check = self._check_language(page_data)
        url_structure_check = self._check_url_structure(page_data)

        # Calculate load time (already measured during fetch, but can add rendering estimate)
        load_time_check = self._check_load_time(page_data)

        # Calculate overall score
        overall_score = self._calculate_overall_score(
            title_check,
            meta_desc_check,
            headings_check,
            alt_tags_check,
            canonical_check,
            robots_check,
            og_check,
            links_check,
            image_size_check,
            load_time_check,
            security_check,
            mobile_check,
        )

        # Compile issues
        critical_issues = []
        warnings = []

        checks = [
            (title_check, "Title Tag"),
            (meta_desc_check, "Meta Description"),
            (headings_check, "Heading Structure"),
            (alt_tags_check, "Alt Tags"),
            (canonical_check, "Canonical Tag"),
            (robots_check, "Robots Meta"),
            (links_check, "Internal Links"),
            (image_size_check, "Image Sizes"),
            (load_time_check, "Page Load Time"),
        ]

        for check, name in checks:
            if check.status == SEOStatus.ERROR:
                critical_issues.extend(
                    [f"[{name}] {rec}" for rec in check.recommendations]
                )
            elif check.status == SEOStatus.WARNING:
                warnings.extend([f"[{name}] {rec}" for rec in check.recommendations])

        passed_checks = sum(1 for check, _ in checks if check.status == SEOStatus.PASS)

        html_size_kb = (
            round(page_data.content_size / 1024, 2) if page_data.content_size else None
        )

        return TechnicalSEOAuditResponse(
            url=request.url,
            final_url=page_data.final_url,
            title_tag=title_check,
            meta_description=meta_desc_check,
            headings=headings_check,
            canonical_tag=canonical_check,
            robots_meta=robots_check,
            open_graph=og_check,
            twitter_cards=twitter_check,
            alt_tags=alt_tags_check,
            images=image_size_check,
            internal_links=links_check,
            page_load_time=load_time_check,
            structured_data=structured_data_check,
            security=security_check,
            mobile_friendly=mobile_check,
            charset=charset_check,
            viewport=viewport_check,
            language=language_check,
            url_structure=url_structure_check,
            overall_score=overall_score,
            critical_issues=critical_issues,
            warnings=warnings,
            passed_checks=passed_checks,
            total_checks=len(checks),
            http_status=page_data.status_code,
            content_type=page_data.headers.get("Content-Type"),
            server=page_data.headers.get("Server"),
            html_size_kb=html_size_kb,
        )

    async def quick_audit(self, request: QuickAuditRequest) -> QuickAuditResponse:
        """
        Perform a quick lightweight SEO audit.

        Args:
            request: QuickAuditRequest with URL

        Returns:
            QuickAuditResponse with essential checks only
        """
        audit_request = TechnicalSEOAuditRequest(
            url=request.url,
            timeout_seconds=request.timeout_seconds,
            check_broken_links=False,  # Skip link checking for speed
        )

        page_data = await self._fetch_page(audit_request)

        # Run essential checks only
        title_check = self._check_title_tag(page_data)
        meta_desc_check = self._check_meta_description(page_data)
        headings_check = self._check_headings(page_data)
        canonical_check = self._check_canonical(page_data)
        robots_check = self._check_robots_meta(page_data)
        alt_tags_check = self._check_alt_tags(page_data)

        # Calculate score
        checks = [
            title_check,
            meta_desc_check,
            headings_check,
            canonical_check,
            robots_check,
            alt_tags_check,
        ]
        passed = sum(1 for c in checks if c.status == SEOStatus.PASS)
        score = int((passed / len(checks)) * 100)

        critical_issues = []
        for check in checks:
            if check.status == SEOStatus.ERROR:
                critical_issues.extend(check.recommendations)

        return QuickAuditResponse(
            url=request.url,
            title_tag=title_check,
            meta_description=meta_desc_check,
            headings=headings_check,
            canonical_tag=canonical_check,
            robots_meta=robots_check,
            alt_tags=alt_tags_check,
            overall_score=score,
            critical_issues=critical_issues,
            http_status=page_data.status_code,
            page_load_time_seconds=page_data.load_time,
        )

    async def _fetch_page(self, request: TechnicalSEOAuditRequest) -> PageData:
        """
        Fetch the page and return parsed data.

        Args:
            request: Audit request with URL

        Returns:
            PageData with HTML, soup, and metadata

        Raises:
            Exception if page cannot be fetched
        """
        start_time = time.time()

        try:
            async with httpx.AsyncClient(
                headers=self.default_headers,
                follow_redirects=request.follow_redirects,
                timeout=request.timeout_seconds,
                verify=False, # Ignore SSL errors for audits
            ) as client:
                response = await client.get(request.url)
                response.raise_for_status()
                load_time = time.time() - start_time

                html = response.text
                soup = BeautifulSoup(html, "lxml")

                return PageData(
                    url=request.url,
                    final_url=str(response.url),
                    html=html,
                    soup=soup,
                    headers=dict(response.headers),
                    status_code=response.status_code,
                    load_time=load_time,
                    content_size=len(html.encode("utf-8")),
                )

        except httpx.RequestError as e:
            logger.error(f"Failed to fetch {request.url}: {e}")
            raise Exception(f"Failed to fetch URL: {str(e)}")
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error {e.response.status_code} when fetching {request.url}")
            raise Exception(f"HTTP error: {e.response.status_code}")

    def _check_title_tag(self, page: PageData) -> TitleTagCheck:
        """Check title tag for SEO best practices."""
        title_tag = page.soup.find("title")
        title = title_tag.get_text(strip=True) if title_tag else None
        length = len(title) if title else 0

        status = SEOStatus.PASS
        recommendations = []

        if not title:
            status = SEOStatus.ERROR
            recommendations.append("Missing title tag - add a descriptive title")
        elif length < self.TITLE_MIN_LENGTH:
            status = SEOStatus.WARNING
            recommendations.append(
                f"Title is too short ({length} chars) - aim for {self.TITLE_MIN_LENGTH}-{self.TITLE_OPTIMAL_MAX} characters"
            )
        elif length > self.TITLE_MAX_LENGTH:
            status = SEOStatus.WARNING
            recommendations.append(
                f"Title is too long ({length} chars) - may be truncated in search results, keep under {self.TITLE_MAX_LENGTH}"
            )
        else:
            recommendations.append("Title tag length is optimal")

        return TitleTagCheck(
            content=title, length=length, status=status, recommendations=recommendations
        )

    def _check_meta_description(self, page: PageData) -> MetaDescriptionCheck:
        """Check meta description for SEO best practices."""
        meta_desc_tag = page.soup.find("meta", attrs={"name": "description"})
        content = meta_desc_tag.get("content", "").strip() if meta_desc_tag else None
        length = len(content) if content else 0

        status = SEOStatus.PASS
        recommendations = []

        if not content:
            status = SEOStatus.ERROR
            recommendations.append(
                "Missing meta description - add a compelling description to improve CTR"
            )
        elif length < self.META_DESC_MIN_LENGTH:
            status = SEOStatus.WARNING
            recommendations.append(
                f"Meta description is too short ({length} chars) - aim for {self.META_DESC_MIN_LENGTH}-{self.META_DESC_OPTIMAL_MAX} characters"
            )
        elif length > self.META_DESC_MAX_LENGTH:
            status = SEOStatus.WARNING
            recommendations.append(
                f"Meta description is too long ({length} chars) - may be truncated, keep under {self.META_DESC_MAX_LENGTH}"
            )
        else:
            recommendations.append("Meta description length is optimal")

        return MetaDescriptionCheck(
            content=content,
            length=length,
            status=status,
            recommendations=recommendations,
        )

    def _check_headings(self, page: PageData) -> HeadingStructureCheck:
        """Check heading structure (H1-H6)."""
        headings = []
        hierarchy_issues = []

        # Extract all headings
        for level in range(1, 7):
            tag_name = f"h{level}"
            for i, tag in enumerate(page.soup.find_all(tag_name)):
                text = tag.get_text(strip=True)
                headings.append(
                    HeadingStructure(
                        tag=tag_name,
                        text=text[:100],  # Limit text length
                        order=len(headings) + 1,
                    )
                )

        h1_count = sum(1 for h in headings if h.tag == "h1")
        h2_count = sum(1 for h in headings if h.tag == "h2")
        h3_count = sum(1 for h in headings if h.tag == "h3")
        h4_count = sum(1 for h in headings if h.tag == "h4")
        h5_count = sum(1 for h in headings if h.tag == "h5")
        h6_count = sum(1 for h in headings if h.tag == "h6")

        # Check hierarchy issues
        if h1_count == 0:
            hierarchy_issues.append(
                "Missing H1 tag - every page should have one main H1"
            )
        elif h1_count > 1:
            hierarchy_issues.append(
                f"Multiple H1 tags found ({h1_count}) - use only one H1 per page"
            )

        # Check for skipped heading levels
        prev_level = 0
        for h in headings:
            curr_level = int(h.tag[1])
            if curr_level > prev_level + 1 and prev_level > 0:
                hierarchy_issues.append(
                    f"Skipped heading level from H{prev_level} to H{curr_level}"
                )
            prev_level = curr_level

        # Determine status
        if h1_count == 0 or h1_count > 1:
            status = SEOStatus.ERROR
        elif len(hierarchy_issues) > 0:
            status = SEOStatus.WARNING
        else:
            status = SEOStatus.PASS

        recommendations = []
        if h1_count == 0:
            recommendations.append("Add an H1 tag that describes the main topic")
        elif h1_count > 1:
            recommendations.append("Consolidate to a single H1 tag")

        if hierarchy_issues:
            recommendations.extend(hierarchy_issues[:3])  # Limit to first 3

        if status == SEOStatus.PASS:
            recommendations.append("Heading structure looks good")

        return HeadingStructureCheck(
            h1_count=h1_count,
            h2_count=h2_count,
            h3_count=h3_count,
            h4_count=h4_count,
            h5_count=h5_count,
            h6_count=h6_count,
            headings=headings[:20],  # Limit to first 20
            has_multiple_h1=h1_count > 1,
            hierarchy_issues=hierarchy_issues,
            status=status,
            recommendations=recommendations,
        )

    def _check_alt_tags(self, page: PageData) -> AltTagCheck:
        """Check for images missing alt text."""
        images = page.soup.find_all("img")
        total = len(images)

        missing_alt = []
        with_alt = 0

        for img in images:
            alt = img.get("alt", "").strip()
            src = img.get("src", "") or img.get("data-src", "") or "unknown"

            if not alt:
                missing_alt.append(
                    ImageWithoutAlt(
                        src=src[:200],
                        tag_type="img",
                        context=img.parent.name if img.parent else None,
                    )
                )
            else:
                with_alt += 1

        without_alt = len(missing_alt)

        # Determine status
        if total == 0:
            status = SEOStatus.INFO
            recommendations = ["No images found on page"]
        elif without_alt == 0:
            status = SEOStatus.PASS
            recommendations = [f"All {total} images have alt text - great job!"]
        elif without_alt / total > 0.5:
            status = SEOStatus.ERROR
            recommendations = [
                f"{without_alt} of {total} images missing alt text - add descriptive alt text for accessibility and SEO"
            ]
        else:
            status = SEOStatus.WARNING
            recommendations = [
                f"{without_alt} of {total} images missing alt text - add alt text to remaining images"
            ]

        return AltTagCheck(
            total_images=total,
            images_with_alt=with_alt,
            images_without_alt=without_alt,
            missing_alt_images=missing_alt[:10],  # Limit to first 10
            status=status,
            recommendations=recommendations,
        )

    def _check_canonical(self, page: PageData) -> CanonicalTagCheck:
        """Check canonical tag."""
        canonical_tag = page.soup.find("link", attrs={"rel": "canonical"})
        href = canonical_tag.get("href", "").strip() if canonical_tag else None

        present = bool(href)

        # Check if self-referencing
        is_self_referencing = None
        if href:
            parsed_href = urlparse(href)
            parsed_url = urlparse(page.final_url)
            is_self_referencing = (
                parsed_href.path == parsed_url.path
                and parsed_href.query == parsed_url.query
            )

        if not present:
            status = SEOStatus.WARNING
            recommendations = [
                "Consider adding a canonical tag to prevent duplicate content issues"
            ]
        else:
            status = SEOStatus.PASS
            recommendations = ["Canonical tag is present"]
            if is_self_referencing:
                recommendations.append("Canonical URL correctly references this page")

        return CanonicalTagCheck(
            present=present,
            href=href,
            is_self_referencing=is_self_referencing,
            status=status,
            recommendations=recommendations,
        )

    def _check_robots_meta(self, page: PageData) -> RobotsMetaCheck:
        """Check robots meta tag."""
        robots_tag = page.soup.find("meta", attrs={"name": "robots"})
        content = robots_tag.get("content", "").lower() if robots_tag else ""

        present = bool(content)
        noindex = "noindex" in content
        nofollow = "nofollow" in content

        if noindex:
            status = SEOStatus.WARNING
            recommendations = [
                "Page has 'noindex' directive - search engines won't index this page"
            ]
        elif present and not noindex and not nofollow:
            status = SEOStatus.INFO
            recommendations = [f"Robots directive set to: {content}"]
        else:
            status = SEOStatus.INFO
            recommendations = [
                "No robots meta tag - search engines will index and follow by default"
            ]

        return RobotsMetaCheck(
            present=present,
            content=content if content else None,
            noindex=noindex,
            nofollow=nofollow,
            status=status,
            recommendations=recommendations,
        )

    def _check_open_graph(self, page: PageData) -> OpenGraphCheck:
        """Check Open Graph tags."""
        og_tags = []

        # Find all OG tags
        for tag in page.soup.find_all(
            "meta", property=lambda x: x and x.startswith("og:")
        ):
            prop = tag.get("property", "")
            content = tag.get("content", "")
            og_tags.append(OpenGraphTag(property=prop, content=content))

        # Check for essential tags
        has_title = any(t.property == "og:title" for t in og_tags)
        has_desc = any(t.property == "og:description" for t in og_tags)
        has_image = any(t.property == "og:image" for t in og_tags)
        has_url = any(t.property == "og:url" for t in og_tags)
        has_type = any(t.property == "og:type" for t in og_tags)

        present = len(og_tags) > 0

        # Determine missing essential tags
        missing = []
        if not has_title:
            missing.append("og:title")
        if not has_desc:
            missing.append("og:description")
        if not has_image:
            missing.append("og:image")

        if missing and present:
            status = SEOStatus.WARNING
            recommendations = [
                f"Missing essential Open Graph tags: {', '.join(missing)}"
            ]
        elif not present:
            status = SEOStatus.INFO
            recommendations = [
                "No Open Graph tags found - add them for better social sharing"
            ]
        else:
            status = SEOStatus.PASS
            recommendations = ["All essential Open Graph tags are present"]

        return OpenGraphCheck(
            present=present,
            tags=og_tags,
            has_og_title=has_title,
            has_og_description=has_desc,
            has_og_image=has_image,
            has_og_url=has_url,
            has_og_type=has_type,
            missing_essential=missing,
            status=status,
            recommendations=recommendations,
        )

    def _check_twitter_cards(self, page: PageData) -> TwitterCardCheck:
        """Check Twitter Card tags."""
        twitter_tags = []

        for tag in page.soup.find_all(
            "meta", attrs={"name": lambda x: x and x.startswith("twitter:")}
        ):
            name = tag.get("name", "")
            content = tag.get("content", "")
            twitter_tags.append(TwitterCardTag(name=name, content=content))

        has_card = any(t.name == "twitter:card" for t in twitter_tags)
        has_title = any(t.name == "twitter:title" for t in twitter_tags)
        has_desc = any(t.name == "twitter:description" for t in twitter_tags)
        has_image = any(t.name == "twitter:image" for t in twitter_tags)

        present = len(twitter_tags) > 0

        if present:
            status = SEOStatus.PASS
            recommendations = ["Twitter Card tags are present"]
        else:
            status = SEOStatus.INFO
            recommendations = [
                "No Twitter Card tags found - add them for better Twitter sharing"
            ]

        return TwitterCardCheck(
            present=present,
            tags=twitter_tags,
            has_card=has_card,
            has_title=has_title,
            has_description=has_desc,
            has_image=has_image,
            status=status,
            recommendations=recommendations,
        )

    async def _check_internal_links(
        self, page: PageData, request: TechnicalSEOAuditRequest
    ) -> InternalLinksCheck:
        """Check for broken internal links."""
        parsed_base = urlparse(page.final_url)
        base_domain = parsed_base.netloc

        # Find all links
        links = page.soup.find_all("a", href=True)
        internal_links = []

        for link in links:
            href = link.get("href", "")
            full_url = urljoin(page.final_url, href)
            parsed_url = urlparse(full_url)

            # Only check internal links
            if parsed_url.netloc == base_domain:
                internal_links.append(
                    {"url": full_url, "anchor": link.get_text(strip=True)[:50]}
                )

        unique_links = {link["url"] for link in internal_links}
        total_links = len(internal_links)
        unique_count = len(unique_links)

        # Check for broken links if enabled
        broken_links = []
        if request.check_broken_links:
            links_to_check = list(unique_links)[: request.max_links_to_check]

            async def check_link(url: str, client: httpx.AsyncClient):
                try:
                    # Get anchor text for this URL
                    anchor_text = next((l["anchor"] for l in internal_links if l["url"] == url), None)
                    
                    response = await client.head(url, timeout=10, follow_redirects=True)
                    if response.status_code >= 400:
                        # Try GET if HEAD fails
                        response = await client.get(url, timeout=10, follow_redirects=True)
                        if response.status_code >= 400:
                            return BrokenLink(
                                url=url,
                                anchor_text=anchor_text,
                                status_code=response.status_code,
                                error=None,
                            )
                except Exception as e:
                    anchor_text = next((l["anchor"] for l in internal_links if l["url"] == url), None)
                    return BrokenLink(
                        url=url,
                        anchor_text=anchor_text,
                        status_code=None,
                        error=str(e),
                    )
                return None

            async with httpx.AsyncClient(headers=self.default_headers, verify=False) as client:
                tasks = [check_link(url, client) for url in links_to_check]
                results = await asyncio.gather(*tasks)
                broken_links = [r for r in results if r is not None]

        if broken_links:
            status = SEOStatus.ERROR
            recommendations = [
                f"Found {len(broken_links)} broken internal links - fix or remove them"
            ]
        elif total_links == 0:
            status = SEOStatus.WARNING
            recommendations = [
                "No internal links found - add internal links for better navigation"
            ]
        else:
            status = SEOStatus.PASS
            recommendations = [
                f"Found {unique_count} unique internal links, all working"
            ]

        return InternalLinksCheck(
            total_internal_links=total_links,
            unique_internal_links=unique_count,
            broken_links=broken_links,
            status=status,
            recommendations=recommendations,
        )

    async def _check_image_sizes(self, page: PageData) -> ImageSizeCheck:
        """Check image sizes and dimensions."""
        images = page.soup.find_all("img")
        oversized = []
        without_dimensions = []
        
        # We will collect tasks for images that actually have a source
        image_sources = []

        for img in images:
            src = img.get("src", "") or img.get("data-src", "")
            width = img.get("width")
            height = img.get("height")
            
            full_url = urljoin(page.final_url, src)

            # Check for missing dimensions
            if not width or not height:
                without_dimensions.append(src[:200] if src else "unknown")

            if src and not src.startswith("data:"):
                image_sources.append({"src": src, "url": full_url, "width": width, "height": height})
                
        # Check actual file sizes concurrently
        async def check_image_size(img_data: dict, client: httpx.AsyncClient):
            try:
                response = await client.head(img_data["url"], timeout=5, follow_redirects=True)
                content_length = response.headers.get("Content-Length")
                if content_length:
                    size_kb = int(content_length) / 1024
                    if size_kb > self.MAX_IMAGE_SIZE_KB:
                        return ImageSizeIssue(
                            src=img_data["src"],
                            width=int(img_data["width"]) if img_data["width"] and str(img_data["width"]).isdigit() else None,
                            height=int(img_data["height"]) if img_data["height"] and str(img_data["height"]).isdigit() else None,
                            file_size_kb=round(size_kb, 2),
                            issue=f"Image size ({size_kb:.1f} KB) exceeds recommended maximum of {self.MAX_IMAGE_SIZE_KB} KB"
                        )
            except Exception as e:
                logger.debug(f"Failed to check size for {img_data['url']}: {e}")
            return None
            
        async with httpx.AsyncClient(headers=self.default_headers, verify=False) as client:
            tasks = [check_image_size(img, client) for img in image_sources]
            results = await asyncio.gather(*tasks)
            oversized = [r for r in results if r is not None]

        if oversized:
            status = SEOStatus.ERROR
            recommendations = [f"Found {len(oversized)} oversized images (> {self.MAX_IMAGE_SIZE_KB}KB) - compress them for better performance"]
        elif without_dimensions and len(images) > 0:
            status = SEOStatus.WARNING
            recommendations = [
                f"{len(without_dimensions)} images missing width/height attributes - add them to prevent layout shift"
            ]
        else:
            status = SEOStatus.PASS
            recommendations = ["Images have proper dimensions defined and are well-sized"]

        return ImageSizeCheck(
            total_images=len(images),
            oversized_images=oversized,
            images_without_dimensions=without_dimensions[:10],
            status=status,
            recommendations=recommendations,
        )

    def _check_load_time(self, page: PageData) -> PageLoadTimeCheck:
        """Evaluate page load time."""
        load_time = page.load_time

        if load_time < 1:
            status = SEOStatus.PASS
            recommendations = [f"Excellent load time: {load_time:.2f}s"]
        elif load_time < 2:
            status = SEOStatus.PASS
            recommendations = [f"Good load time: {load_time:.2f}s"]
        elif load_time < self.CRITICAL_LOAD_TIME:
            status = SEOStatus.WARNING
            recommendations = [
                f"Load time is {load_time:.2f}s - consider optimizing for better user experience"
            ]
        else:
            status = SEOStatus.ERROR
            recommendations = [
                f"Slow load time: {load_time:.2f}s - optimization needed"
            ]

        return PageLoadTimeCheck(
            load_time_seconds=round(load_time, 3),
            status=status,
            recommendations=recommendations,
            metrics={
                "html_size_bytes": page.content_size,
                "html_size_kb": round(page.content_size / 1024, 2)
                if page.content_size
                else 0,
            },
        )

    def _check_structured_data(self, page: PageData) -> StructuredDataCheck:
        """Check for structured data / Schema.org."""
        # Find JSON-LD scripts
        json_ld_scripts = []
        schema_types = []

        for script in page.soup.find_all("script", type="application/ld+json"):
            content = script.string
            if content:
                json_ld_scripts.append(content[:500])  # Store first 500 chars
                # Try to extract @type
                try:
                    import json

                    data = json.loads(content)
                    if isinstance(data, dict):
                        if "@type" in data:
                            schema_types.append(data["@type"])
                    elif isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and "@type" in item:
                                schema_types.append(item["@type"])
                except:
                    pass

        # Check for microdata
        microdata_items = len(page.soup.find_all(attrs={"itemscope": True}))

        # Check for RDFa
        rdfa_items = len(page.soup.find_all(attrs={"typeof": True}))

        present = bool(json_ld_scripts or microdata_items or rdfa_items)

        if json_ld_scripts:
            status = SEOStatus.PASS
            recommendations = [
                f"Found structured data: {', '.join(set(schema_types))}"
                if schema_types
                else "Structured data present"
            ]
        elif microdata_items:
            status = SEOStatus.INFO
            recommendations = [
                f"Found {microdata_items} microdata items - consider using JSON-LD instead"
            ]
        else:
            status = SEOStatus.INFO
            recommendations = [
                "No structured data found - consider adding Schema.org markup for rich snippets"
            ]

        return StructuredDataCheck(
            present=present,
            types=list(set(schema_types)),
            json_ld_scripts=json_ld_scripts[:3],  # Limit to first 3
            microdata_count=microdata_items,
            rdfa_count=rdfa_items,
            status=status,
            recommendations=recommendations,
        )

    def _check_security(self, page: PageData) -> SecurityCheck:
        """Check basic security indicators."""
        is_https = page.final_url.startswith("https://")

        # Check for mixed content
        mixed_content = False
        if is_https:
            # Check for http:// resources
            http_resources = page.soup.find_all(
                src=lambda x: x and x.startswith("http://")
            )
            http_resources += page.soup.find_all(
                href=lambda x: x and x.startswith("http://")
            )
            mixed_content = len(http_resources) > 0

        if not is_https:
            status = SEOStatus.ERROR
            recommendations = [
                "Page not using HTTPS - switch to HTTPS for security and SEO benefits"
            ]
        elif mixed_content:
            status = SEOStatus.WARNING
            recommendations = [
                "Mixed content detected - update HTTP resources to HTTPS"
            ]
        else:
            status = SEOStatus.PASS
            recommendations = ["HTTPS is properly configured"]

        return SecurityCheck(
            is_https=is_https,
            mixed_content=mixed_content,
            status=status,
            recommendations=recommendations,
        )

    def _check_mobile_friendly(self, page: PageData) -> MobileFriendlyCheck:
        """Check mobile-friendly indicators."""
        viewport = page.soup.find("meta", attrs={"name": "viewport"})
        has_viewport = bool(viewport)

        # Check for media queries in style tags
        media_queries = False
        for style in page.soup.find_all("style"):
            if style.string and "@media" in style.string:
                media_queries = True
                break

        if has_viewport:
            status = SEOStatus.PASS
            recommendations = ["Viewport meta tag is present - page is mobile-friendly"]
        else:
            status = SEOStatus.ERROR
            recommendations = [
                "Missing viewport meta tag - add it for mobile responsiveness"
            ]

        return MobileFriendlyCheck(
            viewport_meta=has_viewport,
            media_queries_detected=media_queries,
            status=status,
            recommendations=recommendations,
        )

    def _check_charset(self, page: PageData) -> MetaCharsetCheck:
        """Check charset meta tag."""
        charset_meta = page.soup.find("meta", charset=True)
        if not charset_meta:
            charset_meta = page.soup.find(
                "meta",
                attrs={"http-equiv": lambda x: x and x.lower() == "content-type"},
            )

        charset = None
        if charset_meta:
            charset = charset_meta.get("charset") or charset_meta.get("content", "")
            # Extract charset from content-type if needed
            if "charset=" in str(charset):
                match = re.search(r"charset=([^\s;]+)", str(charset), re.IGNORECASE)
                if match:
                    charset = match.group(1)

        present = bool(charset)

        return MetaCharsetCheck(
            present=present,
            charset=charset,
            status=SEOStatus.PASS if present else SEOStatus.WARNING,
        )

    def _check_viewport(self, page: PageData) -> ViewportCheck:
        """Check viewport meta tag specifically."""
        viewport = page.soup.find("meta", attrs={"name": "viewport"})

        present = bool(viewport)
        content = viewport.get("content", "") if viewport else None

        return ViewportCheck(
            present=present,
            content=content if content else None,
            status=SEOStatus.PASS if present else SEOStatus.ERROR,
        )

    def _check_language(self, page: PageData) -> LanguageCheck:
        """Check HTML lang attribute and hreflang tags."""
        html_tag = page.soup.find("html")
        lang = html_tag.get("lang") if html_tag else None

        # Find hreflang tags
        hreflangs = []
        for link in page.soup.find_all("link", attrs={"rel": "alternate"}):
            if link.get("hreflang"):
                hreflangs.append(
                    {"hreflang": link.get("hreflang"), "href": link.get("href", "")}
                )

        if lang:
            status = SEOStatus.PASS
            recommendations = [f"HTML language set to: {lang}"]
        else:
            status = SEOStatus.WARNING
            recommendations = [
                "Missing HTML lang attribute - add it to specify page language"
            ]

        return LanguageCheck(
            lang_attribute=lang,
            hreflang_tags=hreflangs,
            status=status,
            recommendations=recommendations,
        )

    def _check_url_structure(self, page: PageData) -> URLStructureCheck:
        """Analyze URL structure for SEO-friendliness."""
        parsed = urlparse(page.final_url)
        path = parsed.path

        issues = []

        # Check for underscores
        has_underscores = "_" in path
        if has_underscores:
            issues.append("URL contains underscores - use hyphens instead")

        # Check for uppercase
        has_uppercase = any(c.isupper() for c in path)
        if has_uppercase:
            issues.append("URL contains uppercase letters - use lowercase only")

        # Check for special characters
        has_special = bool(re.search(r"[^a-zA-Z0-9_\-/\.]", path))
        if has_special:
            issues.append("URL contains special characters - keep URLs simple")

        is_friendly = not (has_underscores or has_uppercase or has_special)

        return URLStructureCheck(
            url=page.final_url,
            is_seo_friendly=is_friendly,
            has_underscores=has_underscores,
            has_uppercase=has_uppercase,
            has_special_chars=has_special,
            issues=issues,
            status=SEOStatus.PASS if is_friendly else SEOStatus.WARNING,
        )

    def _calculate_overall_score(self, *checks) -> int:
        """
        Calculate overall SEO score based on individual check results.

        Score calculation:
        - PASS: 100 points
        - INFO: 80 points
        - WARNING: 50 points
        - ERROR: 0 points

        Returns:
            Score from 0-100
        """
        if not checks:
            return 0

        total_score = 0
        total_weight = 0

        # Define weights for different checks
        weights = {
            "TitleTagCheck": 1.5,
            "MetaDescriptionCheck": 1.3,
            "HeadingStructureCheck": 1.2,
            "AltTagCheck": 1.0,
            "CanonicalTagCheck": 0.8,
            "InternalLinksCheck": 1.0,
            "PageLoadTimeCheck": 1.2,
            "SecurityCheck": 1.0,
            "MobileFriendlyCheck": 1.1,
        }

        for check in checks:
            check_name = check.__class__.__name__
            weight = weights.get(check_name, 1.0)
            total_weight += weight

            if check.status == SEOStatus.PASS:
                total_score += 100 * weight
            elif check.status == SEOStatus.INFO:
                total_score += 80 * weight
            elif check.status == SEOStatus.WARNING:
                total_score += 50 * weight
            else:  # ERROR
                total_score += 0

        if total_weight == 0:
            return 0

        return int(total_score / total_weight)


# Global service instance
_technical_seo_service: Optional[TechnicalSEOService] = None


def get_technical_seo_service() -> TechnicalSEOService:
    """
    Get or create the technical SEO service singleton.

    Returns:
        TechnicalSEOService instance
    """
    global _technical_seo_service
    if _technical_seo_service is None:
        _technical_seo_service = TechnicalSEOService()
    return _technical_seo_service

import httpx
from bs4 import BeautifulSoup
import re
from typing import List, Dict, Any
from schemas.competitor_schemas import CompetitorRequest, CompetitorResponse, CompetitorMetrics
from urllib.parse import urlparse

class CompetitorAnalyzerService:
    @staticmethod
    async def analyze_competitor_page(request: CompetitorRequest) -> CompetitorResponse:
        url_str = str(request.competitor_url)
        keyword = request.keyword.lower()
        
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
                response = await client.get(url_str, headers=headers)
                response.raise_for_status()
                html_content = response.text
        except httpx.RequestError as e:
            raise Exception(f"Failed to fetch competitor page: {str(e)}")
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "noscript"]):
            script.decompose()

        text = soup.get_text(separator=' ', strip=True).lower()
        words = text.split()
        word_count = len(words)
        
        # Keyword density
        keyword_count = text.count(keyword)
        keyword_density = round((keyword_count / word_count) * 100, 2) if word_count > 0 else 0.0

        # Headings
        h1_tags = soup.find_all('h1')
        h2_tags = soup.find_all('h2')
        h1_count = len(h1_tags)
        h2_count = len(h2_tags)

        # Images
        images = soup.find_all('img')
        images_count = len(images)
        images_without_alt = sum(1 for img in images if not img.get('alt'))

        # Links
        links = soup.find_all('a', href=True)
        domain = urlparse(url_str).netloc
        
        internal_links = 0
        external_links = 0
        
        for link in links:
            href = link.get('href', '')
            if not href or href.startswith(('javascript:', 'mailto:', 'tel:')):
                continue
            
            link_domain = urlparse(href).netloc
            if not link_domain or link_domain == domain:
                internal_links += 1
            else:
                external_links += 1

        metrics = CompetitorMetrics(
            word_count=word_count,
            h1_count=h1_count,
            h2_count=h2_count,
            keyword_density=keyword_density,
            images_count=images_count,
            images_without_alt=images_without_alt,
            internal_links=internal_links,
            external_links=external_links
        )

        insights = CompetitorAnalyzerService._generate_insights(metrics, keyword)

        return CompetitorResponse(
            url=url_str,
            keyword=keyword,
            metrics=metrics,
            insights=insights
        )

    @staticmethod
    def _generate_insights(metrics: CompetitorMetrics, keyword: str) -> List[str]:
        insights = []
        
        if metrics.word_count < 1000:
            insights.append("Competitor content is relatively short (<1000 words). Creating a comprehensive >1500 word guide could outrank them.")
        elif metrics.word_count > 2500:
            insights.append("Competitor has long-form content (>2500 words). Your article must be highly detailed to compete.")

        if metrics.keyword_density < 0.5:
            insights.append("Competitor has low exact-match keyword density. Ensure you use the exact keyword naturally 1-2% of the time.")
        elif metrics.keyword_density > 3.0:
            insights.append("Competitor may be keyword stuffing. You can beat them with better LSI semantics while keeping density around 1.5%.")

        if metrics.h1_count == 0:
            insights.append("Critical SEO flaw: Competitor is missing an H1 tag. A strong H1 will give you an immediate advantage.")
        elif metrics.h1_count > 1:
            insights.append("Competitor uses multiple H1 tags (not best practice). Stick to a single, optimized H1.")

        if metrics.images_without_alt > 0:
            insights.append(f"Competitor missed {metrics.images_without_alt} image alt tags. Ensure all your images have descriptive alt text.")

        if metrics.internal_links > 20:
            insights.append("Competitor has strong internal linking. You will need excellent pillar/cluster connectivity to compete.")

        if not insights:
            insights.append("Competitor has solid on-page SEO. Focus on building higher quality backlinks and writing more engaging content.")

        return insights

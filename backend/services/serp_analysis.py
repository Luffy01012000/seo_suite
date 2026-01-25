"""
SERP Analysis Service
Fetches and analyzes Search Engine Results Pages using free SERP APIs.
"""

import aiohttp
import asyncio
from typing import List, Optional, Dict, Any
from config import settings
from exceptions import APIKeyMissingError, APIRequestError, ServiceUnavailableError
from schemas.serp_schemas import (
    OrganicResult, SERPFeature, PeopleAlsoAsk, RelatedSearch,
    SERPAnalysisResponse, SERPFeatureType
)
from pydantic import HttpUrl
import logging

logger = logging.getLogger(__name__)


class SERPAnalysisService:
    """
    Service for analyzing Search Engine Results Pages.
    Supports SerpAPI and ValueSERP (can add more providers).
    """
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.cache: Dict[str, SERPAnalysisResponse] = {}
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def analyze_serp(
        self,
        keyword: str,
        language: str = "en",
        country: str = "us",
        device: str = "desktop",
        num_results: int = 10
    ) -> SERPAnalysisResponse:
        """
        Analyze SERP for a given keyword.
        
        Args:
            keyword: Search query to analyze
            language: Language code
            country: Country code
            device: Device type (desktop, mobile, tablet)
            num_results: Number of organic results to fetch
            
        Returns:
            Complete SERP analysis with organic results and features
        """
        cache_key = f"{keyword}_{language}_{country}_{device}"
        
        # Check cache
        if cache_key in self.cache:
            logger.info(f"Returning cached SERP analysis for: {keyword}")
            cached = self.cache[cache_key]
            cached.cached = True
            return cached
        
        # Determine which SERP API to use
        if settings.serpapi_key:
            result = await self._analyze_with_serpapi(
                keyword, language, country, device, num_results
            )
        elif settings.valueserpapi_key:
            result = await self._analyze_with_valueserp(
                keyword, language, country, device, num_results
            )
        else:
            # No SERP API configured - return mock/limited data
            logger.warning("No SERP API configured. Returning limited mock data.")
            result = self._create_mock_serp_response(keyword)
        
        # Cache the result
        self.cache[cache_key] = result
        
        return result
    
    async def _analyze_with_serpapi(
        self,
        keyword: str,
        language: str,
        country: str,
        device: str,
        num_results: int
    ) -> SERPAnalysisResponse:
        """Fetch SERP data from SerpAPI"""
        if not self.session:
            raise RuntimeError("Session not initialized")
        
        url = "https://serpapi.com/search"
        params = {
            "q": keyword,
            "api_key": settings.serpapi_key,
            "engine": "google",
            "gl": country,
            "hl": language,
            "device": device,
            "num": num_results
        }
        
        try:
            async with self.session.get(url, params=params) as response:
                if response.status == 401:
                    raise APIKeyMissingError("Invalid SerpAPI key")
                elif response.status == 429:
                    raise APIRequestError("SerpAPI rate limit exceeded")
                elif response.status != 200:
                    raise APIRequestError(f"SerpAPI error: {response.status}")
                
                data = await response.json()
                return self._parse_serpapi_response(keyword, data)
                
        except aiohttp.ClientError as e:
            raise APIRequestError(f"Network error: {e}")
    
    async def _analyze_with_valueserp(
        self,
        keyword: str,
        language: str,
        country: str,
        device: str,
        num_results: int
    ) -> SERPAnalysisResponse:
        """Fetch SERP data from ValueSERP"""
        if not self.session:
            raise RuntimeError("Session not initialized")
        
        url = "https://api.valueserp.com/search"
        params = {
            "q": keyword,
            "api_key": settings.valueserpapi_key,
            "gl": country,
            "hl": language,
            "device": device,
            "num": num_results,
            "output": "json"
        }
        
        try:
            async with self.session.get(url, params=params) as response:
                if response.status == 401:
                    raise APIKeyMissingError("Invalid ValueSERP key")
                elif response.status != 200:
                    raise APIRequestError(f"ValueSERP error: {response.status}")
                
                data = await response.json()
                return self._parse_valueserp_response(keyword, data)
                
        except aiohttp.ClientError as e:
            raise APIRequestError(f"Network error: {e}")
    
    def _parse_serpapi_response(self, keyword: str, data: Dict[str, Any]) -> SERPAnalysisResponse:
        """Parse SerpAPI response into our schema"""
        organic_results = []
        features = []
        people_also_ask = []
        related_searches = []
        
        # Parse organic results
        if "organic_results" in data:
            for idx, result in enumerate(data["organic_results"][:10]):
                try:
                    organic_results.append(
                        OrganicResult(
                            position=idx + 1,
                            title=result.get("title", ""),
                            url=result.get("link", ""),
                            displayed_url=result.get("displayed_link", result.get("link", "")),
                            snippet=result.get("snippet", ""),
                            domain=self._extract_domain(result.get("link", "")),
                            date=result.get("date"),
                            rich_snippet=result.get("rich_snippet"),
                            sitelinks=result.get("sitelinks")
                        )
                    )
                except Exception as e:
                    logger.warning(f"Error parsing organic result: {e}")
        
        # Parse featured snippet
        if "answer_box" in data:
            features.append(
                SERPFeature(
                    feature_type=SERPFeatureType.FEATURED_SNIPPET,
                    title=data["answer_box"].get("title"),
                    snippet=data["answer_box"].get("answer"),
                    source_url=data["answer_box"].get("link"),
                    source_domain=self._extract_domain(data["answer_box"].get("link", ""))
                )
            )
        
        # Parse People Also Ask
        if "related_questions" in data:
            for q in data["related_questions"]:
                people_also_ask.append(
                    PeopleAlsoAsk(
                        question=q.get("question", ""),
                        answer=q.get("snippet"),
                        source_url=q.get("link"),
                        source_domain=self._extract_domain(q.get("link", ""))
                    )
                )
        
        # Parse related searches
        if "related_searches" in data:
            for rs in data["related_searches"]:
                related_searches.append(
                    RelatedSearch(
                        keyword=rs.get("query", "")
                    )
                )
        
        # Extract other SERP features
        if "knowledge_graph" in data:
            features.append(
                SERPFeature(
                    feature_type=SERPFeatureType.KNOWLEDGE_PANEL,
                    title=data["knowledge_graph"].get("title"),
                    data=data["knowledge_graph"]
                )
            )
        
        if "local_results" in data:
            features.append(
                SERPFeature(
                    feature_type=SERPFeatureType.LOCAL_PACK,
                    data={"local_results": data["local_results"]}
                )
            )
        
        return SERPAnalysisResponse(
            keyword=keyword,
            total_results=data.get("search_information", {}).get("total_results", 0),
            organic_results=organic_results,
            features=features,
            people_also_ask=people_also_ask,
            related_searches=related_searches,
            serp_api_used="serpapi"
        )
    
    def _parse_valueserp_response(self, keyword: str, data: Dict[str, Any]) -> SERPAnalysisResponse:
        """Parse ValueSERP response (similar structure to SerpAPI)"""
        # ValueSERP has similar structure, can reuse SerpAPI parser with minor adjustments
        return self._parse_serpapi_response(keyword, data)
    
    def _create_mock_serp_response(self, keyword: str) -> SERPAnalysisResponse:
        """Create mock SERP response when no API is configured"""
        return SERPAnalysisResponse(
            keyword=keyword,
            total_results=0,
            organic_results=[],
            features=[],
            people_also_ask=[],
            related_searches=[],
            serp_api_used="none",
            insights={"warning": "No SERP API configured. Configure SerpAPI or ValueSERP for real data."}
        )
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            return parsed.netloc.replace("www.", "")
        except:
            return ""


def get_serp_analysis_service() -> SERPAnalysisService:
    """Factory function to create service instance"""
    return SERPAnalysisService()

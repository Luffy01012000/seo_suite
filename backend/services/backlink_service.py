import aiohttp
import asyncio
from typing import List, Optional, Dict, Any
from config import settings
from exceptions import APIKeyMissingError, APIRequestError, APIRateLimitError
from schemas.backlink_schemas import (
    BacklinkAnalysisRequest,
    BacklinkItem,
    BacklinkSummary,
    BacklinkAnalysisResponse
)
import logging

logger = logging.getLogger(__name__)


class BacklinkService:
    """
    Service for fetching backlink data using DataForSEO Backlinks API.
    """
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.cache: Dict[str, BacklinkAnalysisResponse] = {}
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
            
    async def analyze_backlinks(self, request: BacklinkAnalysisRequest) -> BacklinkAnalysisResponse:
        """
        Analyze backlinks for a given target.
        
        Args:
            request: BacklinkAnalysisRequest object
            
        Returns:
            Complete backlink analysis response
        """
        cache_key = f"{request.target}_{request.mode}_{request.limit}"
        
        # Check cache
        if cache_key in self.cache:
            logger.info(f"Returning cached backlink analysis for: {request.target}")
            cached = self.cache[cache_key]
            cached.cached = True
            return cached
            
        # 1. Try Local Data
        local_data = await self._load_local_data(request.target)
        if local_data:
            logger.info(f"Returning local backlink data for: {request.target}")
            result = self._map_local_data_to_response(local_data, request.target)
            self.cache[cache_key] = result
            return result

        # Try DataForSEO if configured
        if settings.has_dataforseo():
            try:
                result = await self._get_dataforseo_backlinks(request)
                self.cache[cache_key] = result
                return result
            except Exception as e:
                logger.error(f"DataForSEO Backlinks API error: {e}")
        
        # No DataForSEO or error - return mock data for demonstration
        logger.warning("Returning mock backlink data.")
        result = self._create_mock_backlink_response(request.target)
        self.cache[cache_key] = result
        return result

    async def _load_local_data(self, target: str) -> Optional[Dict[str, Any]]:
        """Check if a local JSON file exists for the domain"""
        import os
        import json
        
        # Clean target for filename
        clean_target = target.replace("https://", "").replace("http://", "").strip("/")
        
        variations = [
            clean_target,
            f"www.{clean_target}" if not clean_target.startswith("www.") else clean_target.replace("www.", ""),
        ]
        
        # Determine data directory (backend/data/backlinks)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(os.path.dirname(current_dir), "data", "backlinks")
        
        for var in variations:
            file_path = os.path.join(data_dir, f"{var}.json")
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                    # Support SEMrush wrapper
                    if "data" in data and isinstance(data["data"], dict):
                        return data["data"]
                    return data
                except Exception as e:
                    logger.error(f"Error loading local backlink file {file_path}: {e}")
        return None

    def _map_local_data_to_response(self, data: Dict[str, Any], target: str) -> BacklinkAnalysisResponse:
        """Map raw JSON data (SEMrush format) to our response model"""
        overview = data.get("backlinks_overview", {})
        summary = BacklinkSummary(
            total_backlinks=overview.get("total", 0),
            referring_domains=overview.get("domains_num", 0),
            referring_ips=overview.get("ips_num", 0),
            dofollow_percent=overview.get("dofollow_percent", 0.0),
            rank=overview.get("ascore", 0)
        )
        
        backlinks = []
        for item in data.get("backlinks_list", []):
            backlinks.append(BacklinkItem(
                url_from=item.get("link", ""),
                url_to=item.get("target_link", f"https://{target}/"),
                title=item.get("link_title", "Untitled"),
                anchor=item.get("anchor", ""),
                rank=item.get("page_score", 0),
                is_dofollow=not item.get("nofollow", False),
                is_broken=item.get("lostlink", False)
            ))
            
        return BacklinkAnalysisResponse(
            target=target,
            summary=summary,
            backlinks=backlinks,
            data_source="local_file"
        )
        
    async def _get_dataforseo_backlinks(self, request: BacklinkAnalysisRequest) -> BacklinkAnalysisResponse:
        """Fetch backlink data from DataForSEO"""
        if not self.session:
            raise RuntimeError("Session not initialized. Use async context manager.")
            
        # 1. Fetch Summary
        summary = await self._fetch_summary(request.target, request.mode)
        
        # 2. Fetch Detailed Links
        links = await self._fetch_links(request.target, request.mode, request.limit)
        
        return BacklinkAnalysisResponse(
            target=request.target,
            summary=summary,
            backlinks=links,
            data_source="dataforseo"
        )
        
    async def _fetch_summary(self, target: str, mode: str) -> BacklinkSummary:
        """Fetch backlink summary from DataForSEO"""
        url = "https://api.dataforseo.com/v3/backlinks/summary/live"
        auth = aiohttp.BasicAuth(login=settings.dataforseo_login, password=settings.dataforseo_password)
        
        # Map our mode to DataForSEO mode
        dfseo_mode = "as_domain" if mode == "domain" else ("as_subdomain" if mode == "subdomain" else "as_url")
        
        payload = [{"target": target, "mode": dfseo_mode}]
        
        async with self.session.post(url, json=payload, auth=auth) as response:
            if response.status != 200:
                raise Exception(f"DataForSEO Summary error: {response.status}")
                
            data = await response.json()
            return self._parse_summary_response(data)
            
    async def _fetch_links(self, target: str, mode: str, limit: int) -> List[BacklinkItem]:
        """Fetch detailed links from DataForSEO"""
        url = "https://api.dataforseo.com/v3/backlinks/links/live"
        auth = aiohttp.BasicAuth(login=settings.dataforseo_login, password=settings.dataforseo_password)
        
        dfseo_mode = "as_domain" if mode == "domain" else ("as_subdomain" if mode == "subdomain" else "as_url")
        
        payload = [{"target": target, "mode": dfseo_mode, "limit": limit, "order_by": ["rank,desc"]}]
        
        async with self.session.post(url, json=payload, auth=auth) as response:
            if response.status != 200:
                raise Exception(f"DataForSEO Links error: {response.status}")
                
            data = await response.json()
            return self._parse_links_response(data)
            
    def _parse_summary_response(self, data: Dict[str, Any]) -> BacklinkSummary:
        """Parse DataForSEO summary response"""
        try:
            if "tasks" in data and len(data["tasks"]) > 0:
                result = data["tasks"][0].get("result", [{}])[0]
                return BacklinkSummary(
                    total_backlinks=result.get("backlinks", 0),
                    referring_domains=result.get("referring_domains", 0),
                    referring_main_domains=result.get("referring_main_domains", 0),
                    referring_ips=result.get("referring_ips", 0),
                    referring_subnets=result.get("referring_subnets", 0),
                    dofollow_percent=result.get("dofollow_percent", 0.0),
                    rank=result.get("rank", 0)
                )
        except Exception as e:
            logger.error(f"Error parsing summary: {e}")
        return BacklinkSummary()
        
    def _parse_links_response(self, data: Dict[str, Any]) -> List[BacklinkItem]:
        """Parse DataForSEO links response"""
        items = []
        try:
            if "tasks" in data and len(data["tasks"]) > 0:
                result_list = data["tasks"][0].get("result", [{}])[0].get("items", [])
                for item in result_list:
                    items.append(BacklinkItem(
                        url_from=item.get("url_from", ""),
                        url_to=item.get("url_to", ""),
                        title=item.get("page_from_title"),
                        anchor=item.get("anchor"),
                        rank=item.get("rank"),
                        is_dofollow=item.get("dofollow", True),
                        first_seen=item.get("first_seen"),
                        last_seen=item.get("last_seen"),
                        is_broken=item.get("is_broken", False)
                    ))
        except Exception as e:
            logger.error(f"Error parsing links: {e}")
        return items
        
    def _create_mock_backlink_response(self, target: str) -> BacklinkAnalysisResponse:
        """Create mock data for demonstration"""
        summary = BacklinkSummary(
            total_backlinks=1250,
            referring_domains=450,
            referring_main_domains=420,
            referring_ips=380,
            referring_subnets=350,
            dofollow_percent=75.5,
            rank=45
        )
        
        backlinks = [
            BacklinkItem(
                url_from="https://techcrunch.com/2023/10/12/example-article/",
                url_to=f"https://{target}/",
                title="TechCrunch - Innovations in SEO",
                anchor="SEO Suite Tools",
                rank=85,
                is_dofollow=True,
                first_seen="2023-10-12",
                last_seen="2024-03-20"
            ),
            BacklinkItem(
                url_from="https://medium.com/@seo-expert/best-tools-for-2024",
                url_to=f"https://{target}/blog/keyword-research",
                title="SEO Expert on Medium",
                anchor="AI Powered SEO",
                rank=72,
                is_dofollow=True,
                first_seen="2024-01-05",
                last_seen="2024-03-22"
            ),
            BacklinkItem(
                url_from="https://wikipedia.org/wiki/Search_engine_optimization",
                url_to=f"https://{target}/",
                title="SEO - Wikipedia",
                anchor=target,
                rank=98,
                is_dofollow=False,
                first_seen="2022-05-15",
                last_seen="2024-03-21"
            )
        ]
        
        return BacklinkAnalysisResponse(
            target=target,
            summary=summary,
            backlinks=backlinks,
            data_source="mock"
        )


def get_backlink_service() -> BacklinkService:
    """Factory function for BacklinkService"""
    return BacklinkService()

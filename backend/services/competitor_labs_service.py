import aiohttp
import asyncio
from typing import List, Optional, Dict, Any
from config import settings
from schemas.competitor_schemas import (
    DomainOverview,
    RankedKeyword,
    DomainCompetitor,
    DomainIntelligenceResponse
)
import logging
import os
import json

logger = logging.getLogger(__name__)

class CompetitorLabsService:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.cache: Dict[str, DomainIntelligenceResponse] = {}

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def analyze_domain(self, domain: str) -> DomainIntelligenceResponse:
        """
        Analyze a domain to get SpyFu-like metrics.
        Prioritizes:
        1. Local JSON data (backend/data/competitors/{domain}.json)
        2. DataForSEO Labs API (if credentials exist)
        3. Mock data (fallback)
        """
        cache_key = domain
        if cache_key in self.cache:
            return self.cache[cache_key]

        # 1. Try Local Data
        local_data = await self._load_local_data(domain)
        if local_data:
            logger.info(f"Using local competitor data for: {domain}")
            result = self._map_local_data_to_response(local_data, domain)
            self.cache[cache_key] = result
            return result

        # 2. Try DataForSEO if configured
        if settings.has_dataforseo():
            try:
                logger.info(f"Fetching live DataForSEO Labs data for: {domain}")
                result = await self._get_dataforseo_domain_intelligence(domain)
                self.cache[cache_key] = result
                return result
            except Exception as e:
                logger.error(f"DataForSEO Labs API error: {e}")

        # 3. Fallback to Mock Data
        logger.info(f"Generating mock competitor data for: {domain}")
        result = self._create_mock_response(domain)
        self.cache[cache_key] = result
        return result

    async def _get_dataforseo_domain_intelligence(self, domain: str) -> DomainIntelligenceResponse:
        """Fetch real-time data from DataForSEO Labs API"""
        if not self.session:
            self.session = aiohttp.ClientSession()

        auth = aiohttp.BasicAuth(settings.dataforseo_login, settings.dataforseo_password)
        base_url = "https://api.dataforseo.com/v3/dataforseo_labs"
        
        # Clean domain
        clean_target = domain.replace("https://", "").replace("http://", "").strip("/")

        # 1. Fetch Domain Rank & Metrics
        overview = DomainOverview(domain=domain)
        try:
            overview_payload = [{"target": clean_target, "location_code": 2840, "language_code": "en"}]
            async with self.session.post(f"{base_url}/domain_rank/live", json=overview_payload, auth=auth) as resp:
                data = await resp.json()
                if data.get("tasks") and data["tasks"][0].get("result"):
                    res = data["tasks"][0]["result"][0]
                    metrics = res.get("metrics", {}).get("organic", {})
                    overview.organic_keywords = metrics.get("pos_1_100", 0)
                    overview.organic_traffic = metrics.get("etv", 0)
                    overview.organic_cost = metrics.get("estimated_value", 0.0)
                    overview.rank = res.get("rank", 0)
        except Exception as e:
            logger.warning(f"Failed to fetch domain rank: {e}")

        # 2. Fetch Ranked Keywords
        top_keywords = []
        try:
            kw_payload = [{"target": clean_target, "location_code": 2840, "language_code": "en", "limit": 10}]
            async with self.session.post(f"{base_url}/ranked_keywords/live", json=kw_payload, auth=auth) as resp:
                data = await resp.json()
                if data.get("tasks") and data["tasks"][0].get("result"):
                    items = data["tasks"][0]["result"][0].get("items", [])
                    for item in items:
                        kw_data = item.get("keyword_data", {})
                        top_keywords.append(RankedKeyword(
                            keyword=kw_data.get("keyword", "Unknown"),
                            rank=item.get("rank_group", 0),
                            search_volume=kw_data.get("keyword_info", {}).get("search_volume", 0),
                            cpc=kw_data.get("keyword_info", {}).get("cpc", 0.0),
                            traffic_est=item.get("etv", 0)
                        ))
        except Exception as e:
            logger.warning(f"Failed to fetch ranked keywords: {e}")

        # 3. Fetch Domain Competitors
        top_competitors = []
        try:
            comp_payload = [{"target": clean_target, "location_code": 2840, "language_code": "en", "limit": 5}]
            async with self.session.post(f"{base_url}/competitors_domain/live", json=comp_payload, auth=auth) as resp:
                data = await resp.json()
                if data.get("tasks") and data["tasks"][0].get("result"):
                    items = data["tasks"][0]["result"][0].get("items", [])
                    for item in items:
                        top_competitors.append(DomainCompetitor(
                            domain=item.get("domain", "Unknown"),
                            shared_keywords=item.get("intersecting_keywords_count", 0),
                            relevance=item.get("competitor_relevance", 0.0),
                            organic_traffic_est=item.get("metrics", {}).get("organic", {}).get("etv", 0)
                        ))
        except Exception as e:
            logger.warning(f"Failed to fetch domain competitors: {e}")

        return DomainIntelligenceResponse(
            target=domain,
            overview=overview,
            top_keywords=top_keywords,
            top_competitors=top_competitors,
            data_source="dataforseo"
        )

    async def _load_local_data(self, domain: str) -> Optional[Dict[str, Any]]:
        """Find and load a local JSON file for the domain"""
        clean_domain = domain.replace("https://", "").replace("http://", "").strip("/")
        variations = [
            clean_domain, 
            f"www.{clean_domain}" if not clean_domain.startswith("www.") else clean_domain.replace("www.", "")
        ]
        
        # Consistent directory pattern (matching backlink service)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(os.path.dirname(current_dir), "data", "competitors")
        
        # Ensure dir exists
        os.makedirs(data_dir, exist_ok=True)
        
        for var in variations:
            file_path = os.path.join(data_dir, f"{var}.json")
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r') as f:
                        return json.load(f)
                except Exception as e:
                    logger.error(f"Error loading local competitor file: {e}")
        return None

    def _map_local_data_to_response(self, data: Dict[str, Any], domain: str) -> DomainIntelligenceResponse:
        """Map raw JSON to our Pydantic response models"""
        overview_data = data.get("overview", {})
        overview = DomainOverview(
            domain=domain,
            organic_keywords=overview_data.get("organic_keywords", 0),
            organic_traffic=overview_data.get("organic_traffic", 0),
            organic_cost=overview_data.get("organic_cost", 0.0),
            paid_keywords=overview_data.get("paid_keywords", 0),
            rank=overview_data.get("rank", 0),
            historical_data=data.get("historical_data", [])
        )
        
        keywords = []
        for kw in data.get("top_keywords", []):
            keywords.append(RankedKeyword(**kw))
            
        competitors = []
        for comp in data.get("top_competitors", []):
            competitors.append(DomainCompetitor(**comp))
            
        return DomainIntelligenceResponse(
            target=domain,
            overview=overview,
            top_keywords=keywords,
            top_competitors=competitors,
            data_source="local_file"
        )

    def _create_mock_response(self, domain: str) -> DomainIntelligenceResponse:
        """Create rich mock data matching SpyFu's visual metrics"""
        overview = DomainOverview(
            domain=domain,
            organic_keywords=123,
            organic_traffic=45,
            rank=51,
            historical_data=[
                {"month": "Mar 2021", "organic": 40, "paid": 0},
                {"month": "May 2021", "organic": 90, "paid": 0},
                {"month": "Jul 2021", "organic": 140, "paid": 0},
                {"month": "Sep 2021", "organic": 150, "paid": 0},
                {"month": "Nov 2021", "organic": 120, "paid": 0},
                {"month": "Jan 2022", "organic": 70, "paid": 0},
                {"month": "Mar 2022", "organic": 45, "paid": 0},
            ]
        )
        
        keywords = [
            RankedKeyword(keyword="guar gum", rank=51, traffic_est=18, search_volume=1500),
            RankedKeyword(keyword="guar gum powder", rank=20, traffic_est=9, search_volume=2400),
            RankedKeyword(keyword="guar gum manufacturers", rank=64, traffic_est=3, search_volume=800),
            RankedKeyword(keyword="black seed oil for hair", rank=25, traffic_est=2, search_volume=1200),
            RankedKeyword(keyword="guar gum powder uses", rank=37, traffic_est=1, search_volume=500),
        ]
        
        competitors = [
            DomainCompetitor(domain="ambagums.com", shared_keywords=45, relevance=0.85, organic_traffic_est=1200),
            DomainCompetitor(domain="supremegums.com", shared_keywords=38, relevance=0.72, organic_traffic_est=950),
            DomainCompetitor(domain="agrogums.com", shared_keywords=32, relevance=0.65, organic_traffic_est=800),
            DomainCompetitor(domain="naturments.com", shared_keywords=28, relevance=0.58, organic_traffic_est=600),
            DomainCompetitor(domain="everythingblackseed.com", shared_keywords=15, relevance=0.45, organic_traffic_est=300),
        ]
        
        return DomainIntelligenceResponse(
            target=domain,
            overview=overview,
            top_keywords=keywords,
            top_competitors=competitors,
            data_source="mock"
        )

def get_competitor_labs_service() -> CompetitorLabsService:
    return CompetitorLabsService()

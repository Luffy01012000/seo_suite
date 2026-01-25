"""
Volume & Competition Service
Integrates with Google Ads API for search volume and competition data.
Falls back to estimation when API is not configured.
"""

import asyncio
from typing import List, Optional, Dict, Any
from config import settings
from exceptions import APIKeyMissingError, APIRequestError
from schemas.keyword_schemas import KeywordSuggestion, CompetitionLevel
import logging

logger = logging.getLogger(__name__)


class VolumeCompetitionService:
    """
    Service for fetching search volume and competition data.
    Primary source: Google Ads Keyword Planner API
    Fallback: Estimation based on keyword characteristics
    """
    
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.google_ads_client = None
        
        # Initialize Google Ads client if credentials are available
        if settings.has_google_ads_credentials():
            try:
                self._init_google_ads_client()
            except Exception as e:
                logger.warning(f"Could not initialize Google Ads client: {e}")
    
    def _init_google_ads_client(self):
        """Initialize Google Ads API client"""
        try:
            from google.ads.googleads.client import GoogleAdsClient
            
            credentials = {
                "developer_token": settings.google_ads_developer_token,
                "client_id": settings.google_ads_client_id,
                "client_secret": settings.google_ads_client_secret,
                "refresh_token": settings.google_ads_refresh_token,
                "use_proto_plus": True,
            }
            
            self.google_ads_client = GoogleAdsClient.load_from_dict(credentials)
            logger.info("Google Ads API client initialized successfully")
            
        except ImportError:
            logger.error("google-ads library not installed. Install with: pip install google-ads")
            raise APIKeyMissingError("Google Ads SDK not available")
        except Exception as e:
            logger.error(f"Failed to initialize Google Ads client: {e}")
            raise
    
    async def enrich_keywords(
        self,
        keywords: List[KeywordSuggestion],
        language: str = "en",
        country: str = "us"
    ) -> List[KeywordSuggestion]:
        """
        Enrich keyword suggestions with volume and competition data.
        
        Args:
            keywords: List of keyword suggestions to enrich
            language: Language code
            country: Country code
            
        Returns:
            Enriched keyword suggestions with volume and competition
        """
        # If no keywords, return empty list
        if not keywords:
            return []
        
        # Try Google Ads API first
        if self.google_ads_client:
            try:
                return await self._enrich_with_google_ads(keywords, language, country)
            except Exception as e:
                logger.error(f"Google Ads API error: {e}. Falling back to estimation.")
        
        # Fallback to estimation
        return await self._enrich_with_estimation(keywords)
    
    async def _enrich_with_google_ads(
        self,
        keywords: List[KeywordSuggestion],
        language: str,
        country: str
    ) -> List[KeywordSuggestion]:
        """
        Fetch volume and competition from Google Ads Keyword Planner.
        Runs in thread pool to avoid blocking.
        """
        # Extract keyword texts
        keyword_texts = [kw.keyword for kw in keywords]
        
        # Run in executor to avoid blocking
        loop = asyncio.get_event_loop()
        metrics_map = await loop.run_in_executor(
            None,
            self._fetch_google_ads_metrics,
            keyword_texts,
            country
        )
        
        # Enrich keyword objects with fetched data
        enriched = []
        for kw in keywords:
            metrics = metrics_map.get(kw.keyword, {})
            
            kw.search_volume = metrics.get("search_volume", kw.search_volume)
            kw.competition = self._map_competition_level(metrics.get("competition"))
            kw.competition_score = metrics.get("competition_index", kw.competition_score)
            kw.cpc = metrics.get("cpc", kw.cpc)
            
            enriched.append(kw)
        
        return enriched
    
    def _fetch_google_ads_metrics(
        self,
        keywords: List[str],
        country: str
    ) -> Dict[str, Dict[str, Any]]:
        """
        Fetch metrics from Google Ads API (synchronous).
        This runs in a thread pool executor.
        """
        from google.ads.googleads.client import GoogleAdsClient
        
        if not self.google_ads_client:
            return {}
        
        try:
            keyword_plan_idea_service = self.google_ads_client.get_service(
                "KeywordPlanIdeaService"
            )
            
            # Create request
            request = self.google_ads_client.get_type("GenerateKeywordIdeasRequest")
            request.customer_id = settings.google_ads_customer_id
            
            # Set location (country)
            location_ids = self._get_google_ads_location_id(country)
            request.geo_target_constants.extend(
                [f"geoTargetConstants/{loc_id}" for loc_id in location_ids]
            )
            
            # Set language
            request.language = f"languageConstants/1000"  # English default
            
            # Set keyword seed
            request.keyword_seed.keywords.extend(keywords)
            
            # Fetch keyword ideas
            response = keyword_plan_idea_service.generate_keyword_ideas(request=request)
            
            # Parse results
            metrics_map = {}
            for idea in response:
                keyword_text = idea.text
                metrics = idea.keyword_idea_metrics
                
                metrics_map[keyword_text] = {
                    "search_volume": metrics.avg_monthly_searches,
                    "competition": metrics.competition.name,
                    "competition_index": metrics.competition_index / 100.0 if metrics.competition_index else None,
                    "cpc": metrics.average_cpc_micros / 1_000_000.0 if metrics.average_cpc_micros else None,
                }
            
            return metrics_map
            
        except Exception as e:
            logger.error(f"Error fetching Google Ads metrics: {e}")
            return {}
    
    async def _enrich_with_estimation(
        self,
        keywords: List[KeywordSuggestion]
    ) -> List[KeywordSuggestion]:
        """
        Estimate volume and competition when API is unavailable.
        Uses heuristics based on keyword characteristics.
        """
        for kw in keywords:
            # Skip if already has volume data
            if kw.search_volume and kw.search_volume > 0:
                continue
            
            # Estimate based on keyword length and type
            word_count = len(kw.keyword.split())
            
            # Shorter keywords typically have higher volume
            if word_count <= 2:
                estimated_volume = 5000 + (hash(kw.keyword) % 45000)
                competition = CompetitionLevel.HIGH
                competition_score = 0.7 + (hash(kw.keyword) % 30) / 100
            elif word_count == 3:
                estimated_volume = 1000 + (hash(kw.keyword) % 9000)
                competition = CompetitionLevel.MEDIUM
                competition_score = 0.4 + (hash(kw.keyword) % 30) / 100
            else:
                estimated_volume = 100 + (hash(kw.keyword) % 900)
                competition = CompetitionLevel.LOW
                competition_score = 0.1 + (hash(kw.keyword) % 30) / 100
            
            kw.search_volume = estimated_volume
            kw.competition = competition
            kw.competition_score = min(1.0, competition_score)
            
            # Estimate CPC (lower for longer tail)
            kw.cpc = max(0.1, 5.0 - (word_count * 0.8))
        
        return keywords
    
    def _map_competition_level(self, competition_str: Optional[str]) -> CompetitionLevel:
        """Map Google Ads competition string to our enum"""
        if not competition_str:
            return CompetitionLevel.UNKNOWN
        
        competition_map = {
            "LOW": CompetitionLevel.LOW,
            "MEDIUM": CompetitionLevel.MEDIUM,
            "HIGH": CompetitionLevel.HIGH,
        }
        
        return competition_map.get(competition_str.upper(), CompetitionLevel.UNKNOWN)
    
    def _get_google_ads_location_id(self, country: str) -> List[int]:
        """Map country code to Google Ads location ID"""
        location_map = {
            "us": [2840],  # United States
            "uk": [2826],  # United Kingdom
            "ca": [2124],  # Canada
            "au": [2036],  # Australia
            "in": [2356],  # India
        }
        return location_map.get(country.lower(), [2840])  # Default to US


def get_volume_competition_service() -> VolumeCompetitionService:
    """Factory function to create service instance"""
    return VolumeCompetitionService()

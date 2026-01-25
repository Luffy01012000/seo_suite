"""
Keyword Suggestion Service
Integrates with free keyword suggestion APIs (DataForSEO, etc.)
"""

import aiohttp
import asyncio
from typing import List, Optional, Dict, Any
from config import settings
from exceptions import APIKeyMissingError, APIRequestError, APIRateLimitError
from schemas.keyword_schemas import KeywordSuggestion, CompetitionLevel
import logging

logger = logging.getLogger(__name__)


class KeywordSuggestionService:
    """
    Service for fetching keyword suggestions from free APIs.
    Currently supports DataForSEO free tier (can add more sources).
    """
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.cache: Dict[str, List[KeywordSuggestion]] = {}
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def get_suggestions(
        self,
        seed_keyword: str,
        limit: int = 20,
        language: str = "en",
        country: str = "us"
    ) -> List[KeywordSuggestion]:
        """
        Get keyword suggestions from available APIs.
        
        Args:
            seed_keyword: Seed keyword to generate suggestions from
            limit: Maximum number of suggestions to return
            language: Language code (ISO 639-1)
            country: Country code (ISO 3166-1 alpha-2)
            
        Returns:
            List of KeywordSuggestion objects
        """
        cache_key = f"{seed_keyword}_{language}_{country}_{limit}"
        
        # Check cache first
        if cache_key in self.cache:
            logger.info(f"Returning cached suggestions for: {seed_keyword}")
            return self.cache[cache_key][:limit]
        
        suggestions = []
        
        # Try DataForSEO if configured
        if settings.has_dataforseo():
            try:
                suggestions = await self._get_dataforseo_suggestions(
                    seed_keyword, limit, language, country
                )
            except Exception as e:
                logger.error(f"DataForSEO API error: {e}")
        
        # Fallback to free alternatives if needed
        if not suggestions:
            suggestions = await self._get_fallback_suggestions(seed_keyword, limit)
        
        # Cache results
        self.cache[cache_key] = suggestions
        
        return suggestions[:limit]
    
    async def _get_dataforseo_suggestions(
        self,
        seed_keyword: str,
        limit: int,
        language: str,
        country: str
    ) -> List[KeywordSuggestion]:
        """
        Fetch suggestions from DataForSEO API.
        Uses Google Keyword Suggestions endpoint.
        """
        if not self.session:
            raise RuntimeError("Session not initialized. Use async context manager.")
        
        url = "https://api.dataforseo.com/v3/keywords_data/google/keywords_for_keywords/live"
        
        auth = aiohttp.BasicAuth(
            login=settings.dataforseo_login,
            password=settings.dataforseo_password
        )
        
        payload = [{
            "keywords": [seed_keyword],
            "location_code": self._get_location_code(country),
            "language_code": language,
            "depth": 1,  # Direct suggestions only
            "limit": limit
        }]
        
        try:
            async with self.session.post(url, json=payload, auth=auth) as response:
                if response.status == 401:
                    raise APIKeyMissingError("Invalid DataForSEO credentials")
                elif response.status == 429:
                    raise APIRateLimitError("DataForSEO rate limit exceeded")
                elif response.status != 200:
                    raise APIRequestError(f"DataForSEO API error: {response.status}")
                
                data = await response.json()
                return self._parse_dataforseo_response(data)
                
        except aiohttp.ClientError as e:
            raise APIRequestError(f"Network error: {e}")
    
    async def _get_fallback_suggestions(
        self,
        seed_keyword: str,
        limit: int
    ) -> List[KeywordSuggestion]:
        """
        Fallback method using Google autocomplete suggestions (free).
        This is a simple alternative when no API keys are configured.
        """
        suggestions = []
        
        # Use Google autocomplete API (free, no key required)
        url = "http://suggestqueries.google.com/complete/search"
        params = {
            "client": "firefox",
            "q": seed_keyword
        }
        
        try:
            if not self.session:
                raise RuntimeError("Session not initialized")
                
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    # Google autocomplete returns [query, [suggestions]]
                    if len(data) > 1 and isinstance(data[1], list):
                        for suggestion_text in data[1][:limit]:
                            suggestions.append(
                                KeywordSuggestion(
                                    keyword=suggestion_text,
                                    source="google_autocomplete"
                                )
                            )
        except Exception as e:
            logger.warning(f"Fallback autocomplete failed: {e}")
        
        # If autocomplete fails or returns few results, generate variations
        if len(suggestions) < 5:
            variations = self._generate_keyword_variations(seed_keyword, limit)
            suggestions.extend(variations)
        
        return suggestions[:limit]
    
    def _generate_keyword_variations(
        self,
        seed_keyword: str,
        limit: int
    ) -> List[KeywordSuggestion]:
        """
        Generate basic keyword variations when APIs are unavailable.
        This is a last-resort fallback.
        """
        modifiers = [
            "best", "top", "how to", "what is", "guide", "tutorial",
            "free", "online", "near me", "cheap", "review", "vs"
        ]
        
        variations = []
        for modifier in modifiers[:limit]:
            variation = f"{modifier} {seed_keyword}"
            variations.append(
                KeywordSuggestion(
                    keyword=variation,
                    source="generated"
                )
            )
            
            # Also add suffix version
            if len(variations) < limit:
                variation = f"{seed_keyword} {modifier}"
                variations.append(
                    KeywordSuggestion(
                        keyword=variation,
                        source="generated"
                    )
                )
        
        return variations[:limit]
    
    def _parse_dataforseo_response(self, data: Dict[str, Any]) -> List[KeywordSuggestion]:
        """Parse DataForSEO API response into KeywordSuggestion objects"""
        suggestions = []
        
        try:
            if "tasks" in data and len(data["tasks"]) > 0:
                task = data["tasks"][0]
                if task.get("status_code") == 20000 and "result" in task:
                    for item in task["result"]:
                        if "keyword_data" in item:
                            kw_data = item["keyword_data"]
                            suggestions.append(
                                KeywordSuggestion(
                                    keyword=kw_data.get("keyword", ""),
                                    search_volume=kw_data.get("search_volume"),
                                    competition_score=kw_data.get("competition"),
                                    cpc=kw_data.get("cpc"),
                                    source="dataforseo"
                                )
                            )
        except (KeyError, IndexError, TypeError) as e:
            logger.error(f"Error parsing DataForSEO response: {e}")
        
        return suggestions
    
    def _get_location_code(self, country: str) -> int:
        """Map country code to DataForSEO location code"""
        # Common location codes for DataForSEO
        location_map = {
            "us": 2840,  # United States
            "uk": 2826,  # United Kingdom
            "ca": 2124,  # Canada
            "au": 2036,  # Australia
            "in": 2356,  # India
        }
        return location_map.get(country.lower(), 2840)  # Default to US


# Singleton instance factory
def get_keyword_suggestion_service() -> KeywordSuggestionService:
    """Factory function to create service instance"""
    return KeywordSuggestionService()

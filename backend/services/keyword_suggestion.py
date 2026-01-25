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
        
        # Try Serper.dev if no suggestions yet and it's configured
        if not suggestions and settings.has_serper():
            try:
                suggestions = await self._get_serper_suggestions(
                    seed_keyword, limit
                )
            except Exception as e:
                logger.error(f"Serper.dev API error: {e}")
        
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
        Fallback method using free autocomplete suggestions (Google and DuckDuckGo).
        This provides a good variety of keywords without requiring API keys.
        """
        suggestions_map = {} # Use dict to avoid duplicates
        
        # 1. Try Google Autocomplete
        try:
            google_url = "http://suggestqueries.google.com/complete/search"
            params = {"client": "firefox", "q": seed_keyword}
            
            if not self.session:
                raise RuntimeError("Session not initialized")
                
            async with self.session.get(google_url, params=params) as response:
                if response.status == 200:
                    # Use content_type=None to skip MIME type validation (handles text/javascript etc)
                    data = await response.json(content_type=None)
                    if len(data) > 1 and isinstance(data[1], list):
                        for text in data[1]:
                            if text not in suggestions_map:
                                suggestions_map[text] = KeywordSuggestion(
                                    keyword=text, source="google_autocomplete"
                                )
        except Exception as e:
            logger.warning(f"Google fallback failed: {e}")
            
        # 2. Try DuckDuckGo Autocomplete (another great free source)
        try:
            ddg_url = "https://duckduckgo.com/ac/"
            params = {"q": seed_keyword}
            
            async with self.session.get(ddg_url, params=params) as response:
                if response.status == 200:
                    data = await response.json(content_type=None)
                    # DDG returns list of dicts: [{"phrase": "keyword"}, ...]
                    for item in data:
                        text = item.get("phrase")
                        if text and text not in suggestions_map:
                            suggestions_map[text] = KeywordSuggestion(
                                keyword=text, source="duckduckgo_autocomplete"
                            )
        except Exception as e:
            logger.warning(f"DuckDuckGo fallback failed: {e}")
        
        suggestions = list(suggestions_map.values())
        
        # If still short on results, generate simple variations
        if len(suggestions) < 10:
            variations = self._generate_keyword_variations(
                seed_keyword, max(0, limit - len(suggestions))
            )
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
            "best", "top", "guide", "tutorial", "free", "online", 
            "near me", "cheap", "review", "vs", "tips", "strategy",
            "tools", "software", "services", "comparison"
        ]
        
        variations = []
        for modifier in modifiers[:limit]:
            # Generate prefix variation
            variation = f"{modifier} {seed_keyword}"
            variations.append(
                KeywordSuggestion(
                    keyword=variation.strip(),
                    source="generated_prefix"
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
    
    async def _get_serper_suggestions(
        self,
        seed_keyword: str,
        limit: int
    ) -> List[KeywordSuggestion]:
        """
        Fetch keyword suggestions from Serper.dev API.
        Uses the 'Search' endpoint specifically for related queries.
        """
        if not self.session:
            raise RuntimeError("Session not initialized")
            
        url = "https://google.serper.dev/search"
        headers = {
            "X-API-KEY": settings.serper_api_key,
            "Content-Type": "application/json"
        }
        payload = {
            "q": seed_keyword,
            "gl": "us", # default to US
            "hl": "en"
        }
        
        try:
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 403:
                    raise APIKeyMissingError("Invalid Serper.dev API key")
                elif response.status != 200:
                    raise APIRequestError(f"Serper.dev API error: {response.status}")
                
                data = await response.json()
                return self._parse_serper_response(data, limit)
        except aiohttp.ClientError as e:
            raise APIRequestError(f"Serper.dev network error: {e}")

    def _parse_serper_response(self, data: Dict[str, Any], limit: int) -> List[KeywordSuggestion]:
        """Parse Serper.dev response (relatedQueries prioritized over peopleAlsoAsk)"""
        suggestions = []
        
        # 1. Get related queries (Primary source for keywords)
        related = data.get("relatedQueries", [])
        for item in related:
            query = item.get("query")
            if query:
                suggestions.append(
                    KeywordSuggestion(
                        keyword=query,
                        source="serper_related"
                    )
                )
        
        # 2. Get People Also Ask (Only if we have room, these are questions)
        # We limit questions to avoid overwhelming the keyword list
        if len(suggestions) < limit:
            paa = data.get("peopleAlsoAsk", [])
            for item in paa:
                if len(suggestions) >= limit: break
                question = item.get("question")
                if question:
                    # Simple heuristic: if it has more than 5 words and a question mark, 
                    # it might be a question that's too long for a 'keyword'
                    suggestions.append(
                        KeywordSuggestion(
                            keyword=question,
                            source="serper_paa"
                        )
                    )
        
        return suggestions[:limit]

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

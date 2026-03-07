import httpx
import json
from typing import List

class KeywordResearchService:
    @staticmethod
    async def get_google_suggestions(query: str) -> List[str]:
        """
        Fetch keyword suggestions from Google Autocomplete API without any cost.
        """
        url = f"https://suggestqueries.google.com/complete/search?client=firefox&q={query}"
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                
                # Google Suggest with client=firefox returns JSON: ["query", ["sugg1", "sugg2"]]
                data = response.json()
                
                if len(data) >= 2 and isinstance(data[1], list):
                    return data[1]
                
                return []
        except Exception as e:
            raise Exception(f"Failed to fetch keyword suggestions: {str(e)}")

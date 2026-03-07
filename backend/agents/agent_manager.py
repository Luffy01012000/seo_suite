"""
AI Agent Layer for the SEO SaaS Platform.
This module formalizes the distinct specialized agents handling different SEO disciplines.
"""

from typing import List, Dict, Any
from services.keyword_research import KeywordResearchService
from services.seo_optimizer import get_seo_optimizer_service
from services.technical_seo_service import TechnicalSEOService
from schemas.seo_optimizer_schemas import SEOOptimizeRequest, InternalLinkRequest

class KeywordAgent:
    """Agent responsible for discovering and clustering high-value keywords."""
    
    @staticmethod
    async def discover_keywords(seed_keyword: str) -> List[str]:
        """Free keyword discovery using open data (Google Autocomplete)."""
        return await KeywordResearchService.get_google_suggestions(seed_keyword)


class ContentAgent:
    """Agent responsible for analyzing and optimizing on-page content."""
    
    @staticmethod
    async def analyze_content(article: str, keyword: str, title: str = "", meta_description: str = "") -> Dict[str, Any]:
        """Runs the SEO optimization analysis with Gemini insights."""
        service = get_seo_optimizer_service()
        req = SEOOptimizeRequest(
            article=article,
            keyword=keyword,
            title=title,
            meta_description=meta_description
        )
        response = await service.optimize_article(req)
        return response.model_dump()


class TechnicalAgent:
    """Agent responsible for technical SEO audits and structure."""
    
    @staticmethod
    async def audit_url(url: str) -> Dict[str, Any]:
        """Runs a comprehensive technical audit on a given URL."""
        # Using the existing TechnicalSEOService logic
        service = getattr(TechnicalSEOService, "run_quick_audit", None)
        if service:
            # Assuming run_quick_audit exists as a static/class method
            result = await TechnicalSEOService.run_quick_audit(url)
            return result.model_dump()
        return {"error": "Technical audit service not fully linked."}


class LinkBuilderAgent:
    """Agent responsible for mapping semantic relationships and internal linking."""
    
    @staticmethod
    async def suggest_internal_links(article: str, existing_titles: List[str]) -> Dict[str, Any]:
        """Uses Gemini to suggest contextual internal links."""
        service = get_seo_optimizer_service()
        req = InternalLinkRequest(
            article=article,
            existing_titles=existing_titles
        )
        response = await service.suggest_internal_links(req)
        return response.model_dump()


class AgentManager:
    """Central orchestrator for the AI Agent Layer."""
    keyword_agent = KeywordAgent()
    content_agent = ContentAgent()
    technical_agent = TechnicalAgent()
    link_builder_agent = LinkBuilderAgent()

# Singleton instance
agent_manager = AgentManager()

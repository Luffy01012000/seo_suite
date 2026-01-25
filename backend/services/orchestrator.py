"""
Orchestrator Service
Coordinates multiple services to provide complete keyword analysis workflows.
"""

import asyncio
from typing import List, Dict, Any, Optional
from services.keyword_suggestion import KeywordSuggestionService
from services.volume_competition import VolumeCompetitionService
from services.serp_analysis import SERPAnalysisService
from services.langchain_analysis import LangChainAnalysisService
from schemas.keyword_schemas import (
    KeywordSuggestion, KeywordMetrics, KeywordCluster,
    SearchIntent, DifficultyLevel
)
from schemas.serp_schemas import SERPAnalysisResponse
import logging

logger = logging.getLogger(__name__)


class KeywordOrchestrator:
    """
    Orchestrates the complete keyword research pipeline:
    1. Get keyword suggestions (free APIs)
    2. Enrich with volume/competition (Google Ads)
    3. Analyze SERP (SERP APIs)
    4. AI analysis (LangChain + Gemini)
    """
    
    def __init__(self):
        self.volume_service = VolumeCompetitionService()
        self.langchain_service = LangChainAnalysisService()
    
    async def analyze_keyword_complete(
        self,
        seed_keyword: str,
        language: str = "en",
        country: str = "us",
        limit: int = 20,
        include_suggestions: bool = True,
        include_volume: bool = True,
        include_serp: bool = True,
        include_clustering: bool = True
    ) -> Dict[str, Any]:
        """
        Complete keyword analysis pipeline.
        
        Args:
            seed_keyword: Seed keyword to analyze
            language: Language code
            country: Country code
            limit: Max number of suggestions
            include_suggestions: Whether to fetch related keywords
            include_volume: Whether to fetch volume/competition data
            include_serp: Whether to analyze SERP
            include_clustering: Whether to cluster keywords with AI
            
        Returns:
            Complete analysis with keywords, clusters, and insights
        """
        logger.info(f"Starting complete analysis for: {seed_keyword}")
        
        # Step 1: Get keyword suggestions
        suggestions = []
        if include_suggestions:
            async with KeywordSuggestionService() as suggestion_service:
                suggestions = await suggestion_service.get_suggestions(
                    seed_keyword, limit, language, country
                )
                logger.info(f"Found {len(suggestions)} keyword suggestions")
        else:
            # Just analyze the seed keyword
            suggestions = [KeywordSuggestion(keyword=seed_keyword, source="seed")]
        
        # Step 2: Enrich with volume and competition data
        if include_volume:
            suggestions = await self.volume_service.enrich_keywords(
                suggestions, language, country
            )
            logger.info("Enriched keywords with volume/competition data")
        
        # Step 3: Convert to KeywordMetrics for AI analysis
        keyword_metrics = [
            KeywordMetrics(
                keyword=kw.keyword,
                search_volume=kw.search_volume,
                competition=kw.competition,
                competition_score=kw.competition_score,
                cpc=kw.cpc
            )
            for kw in suggestions
        ]
        
        # Step 4: Classify intent with AI
        keyword_texts = [kw.keyword for kw in keyword_metrics]
        intent_map = await self.langchain_service.classify_intent(keyword_texts)
        
        # Apply intents to metrics
        for kw in keyword_metrics:
            kw.intent = intent_map.get(kw.keyword, SearchIntent.UNKNOWN)
        
        logger.info("Classified keyword intents with AI")
        
        # Step 5: Analyze SERP for seed keyword (optional)
        serp_data = None
        if include_serp:
            async with SERPAnalysisService() as serp_service:
                serp_data = await serp_service.analyze_serp(
                    seed_keyword, language, country
                )
                logger.info("Analyzed SERP data")
                
                # Extract SERP features for difficulty analysis
                serp_features = [f.feature_type.value for f in serp_data.features]
                
                # Analyze difficulty for seed keyword
                seed_kw_metrics = next(
                    (kw for kw in keyword_metrics if kw.keyword == seed_keyword),
                    None
                )
                
                if seed_kw_metrics:
                    difficulty_analysis = await self.langchain_service.analyze_difficulty(
                        seed_keyword,
                        serp_features,
                        seed_kw_metrics.competition_score,
                        seed_kw_metrics.search_volume
                    )
                    
                    # Apply difficulty to seed keyword
                    difficulty_level_str = difficulty_analysis.get("difficulty_level", "MEDIUM")
                    try:
                        seed_kw_metrics.difficulty = DifficultyLevel[difficulty_level_str]
                    except KeyError:
                        seed_kw_metrics.difficulty = DifficultyLevel.MEDIUM
                    
                    seed_kw_metrics.difficulty_score = difficulty_analysis.get("difficulty_score", 50)
        
        # Step 6: Cluster keywords with AI
        clusters = []
        if include_clustering and len(keyword_metrics) >= 2:
            clusters = await self.langchain_service.cluster_keywords(keyword_metrics)
            logger.info(f"Created {len(clusters)} keyword clusters")
        
        # Step 7: Generate strategic recommendations
        insights = await self.langchain_service.generate_recommendations(
            keyword_metrics,
            clusters,
            serp_insights={"serp_features": serp_data.features if serp_data else []}
        )
        logger.info("Generated strategic recommendations")
        
        # Compile results
        data_sources = ["keyword_suggestion"]
        if include_volume:
            data_sources.append("volume_competition")
        if include_serp:
            data_sources.append("serp_analysis")
        data_sources.append("langchain_ai")
        
        return {
            "seed_keyword": seed_keyword,
            "keywords": keyword_metrics,
            "clusters": clusters,
            "serp_analysis": serp_data,
            "insights": insights,
            "total_keywords": len(keyword_metrics),
            "data_sources": data_sources,
            "cached": False
        }
    
    async def get_keyword_suggestions_only(
        self,
        seed_keyword: str,
        language: str = "en",
        country: str = "us",
        limit: int = 20,
        enrich_with_volume: bool = True
    ) -> Dict[str, Any]:
        """
        Get keyword suggestions with optional volume enrichment.
        Faster than full analysis.
        """
        logger.info(f"Getting suggestions for: {seed_keyword}")
        
        # Get suggestions
        async with KeywordSuggestionService() as suggestion_service:
            suggestions = await suggestion_service.get_suggestions(
                seed_keyword, limit, language, country
            )
        
        # Optionally enrich with volume
        if enrich_with_volume:
            suggestions = await self.volume_service.enrich_keywords(
                suggestions, language, country
            )
        
        data_sources = ["keyword_suggestion"]
        if enrich_with_volume:
            data_sources.append("volume_competition")
        
        return {
            "seed_keyword": seed_keyword,
            "total_suggestions": len(suggestions),
            "suggestions": suggestions,
            "data_sources": data_sources,
            "cached": False
        }
    
    async def analyze_serp_with_insights(
        self,
        keyword: str,
        language: str = "en",
        country: str = "us"
    ) -> Dict[str, Any]:
        """
        Analyze SERP with AI-powered content gap analysis.
        """
        logger.info(f"Analyzing SERP with insights for: {keyword}")
        
        # Get SERP data
        async with SERPAnalysisService() as serp_service:
            serp_data = await serp_service.analyze_serp(keyword, language, country)
        
        # Extract competitor data for content gap analysis
        if serp_data.organic_results:
            titles = [result.title for result in serp_data.organic_results[:10]]
            snippets = [result.snippet for result in serp_data.organic_results[:10]]
            
            # AI content gap analysis
            content_gaps = await self.langchain_service.analyze_content_gaps(
                keyword, titles, snippets
            )
            
            # Add insights to SERP data
            serp_data.insights = content_gaps
        
        return {
            "keyword": keyword,
            "serp_analysis": serp_data,
            "cached": serp_data.cached
        }


def get_keyword_orchestrator() -> KeywordOrchestrator:
    """Factory function to create orchestrator instance"""
    return KeywordOrchestrator()

"""
LangChain Analysis Service
AI-powered keyword intelligence using Gemini via LangChain.
Handles intent classification, clustering, difficulty analysis, and recommendations.
"""

import json
import asyncio
from typing import List, Dict, Any, Optional
from config import settings
from schemas.keyword_schemas import (
    KeywordMetrics, KeywordCluster, SearchIntent, DifficultyLevel
)
from prompts.keyword_prompts import (
    INTENT_CLASSIFICATION_PROMPT,
    KEYWORD_CLUSTERING_PROMPT,
    DIFFICULTY_ANALYSIS_PROMPT,
    RECOMMENDATION_PROMPT,
    CONTENT_GAP_PROMPT
)
import logging

logger = logging.getLogger(__name__)


class LangChainAnalysisService:
    """
    Service for AI-powered keyword analysis using LangChain and Gemini.
    This service does NOT fetch keyword data - it analyzes existing data.
    """
    
    def __init__(self):
        self.llm = None
        self._init_llm()
    
    def _init_llm(self):
        """Initialize LangChain LLM with Gemini"""
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            
            self.llm = ChatGoogleGenerativeAI(
                model=settings.gemini_model,
                google_api_key=settings.gemini_api_key,
                temperature=0.3,  # Lower temperature for more consistent analysis
                convert_system_message_to_human=True
            )
            logger.info(f"LangChain LLM initialized with model: {settings.gemini_model}")
            
        except ImportError:
            logger.error("langchain-google-genai not installed")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize LangChain LLM: {e}")
            raise
    
    async def classify_intent(self, keywords: List[str]) -> Dict[str, SearchIntent]:
        """
        Classify search intent for a list of keywords.
        
        Args:
            keywords: List of keyword strings
            
        Returns:
            Dictionary mapping keyword to SearchIntent
        """
        if not keywords:
            return {}
        
        # Format keywords for prompt
        keywords_text = "\n".join([f"- {kw}" for kw in keywords])
        
        # Create chain
        chain = INTENT_CLASSIFICATION_PROMPT | self.llm
        
        # Run in executor to avoid blocking
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: chain.invoke({"keywords": keywords_text})
        )
        
        # Parse response
        try:
            result = self._parse_json_response(response.content)
            
            intent_map = {}
            for classification in result.get("classifications", []):
                keyword = classification.get("keyword")
                intent_str = classification.get("intent", "UNKNOWN").upper()
                
                # Map to enum
                try:
                    intent = SearchIntent[intent_str]
                except KeyError:
                    intent = SearchIntent.UNKNOWN
                
                intent_map[keyword] = intent
            
            return intent_map
            
        except Exception as e:
            logger.error(f"Error parsing intent classification: {e}")
            # Return default intents
            return {kw: SearchIntent.UNKNOWN for kw in keywords}
    
    async def cluster_keywords(
        self,
        keywords: List[KeywordMetrics],
        num_clusters: Optional[int] = None
    ) -> List[KeywordCluster]:
        """
        Cluster keywords into semantic groups.
        
        Args:
            keywords: List of KeywordMetrics objects
            num_clusters: Number of clusters (auto-determined if None)
            
        Returns:
            List of KeywordCluster objects
        """
        if not keywords:
            return []
        
        # Auto-determine cluster count if not specified
        if num_clusters is None:
            num_clusters = max(2, min(8, len(keywords) // 5))
        
        # Format keywords with metrics for better clustering
        keywords_text = "\n".join([
            f"- {kw.keyword} (volume: {kw.search_volume or 'N/A'}, competition: {kw.competition or 'N/A'})"
            for kw in keywords
        ])
        
        # Create chain
        chain = KEYWORD_CLUSTERING_PROMPT | self.llm
        
        # Run in executor
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: chain.invoke({
                "keywords": keywords_text,
                "num_clusters": num_clusters
            })
        )
        
        # Parse response
        try:
            result = self._parse_json_response(response.content)
            
            clusters = []
            for idx, cluster_data in enumerate(result.get("clusters", [])):
                # Map intent string to enum
                intent_str = cluster_data.get("intent", "UNKNOWN").upper()
                try:
                    intent = SearchIntent[intent_str]
                except KeyError:
                    intent = SearchIntent.UNKNOWN
                
                # Calculate average search volume
                cluster_keywords = cluster_data.get("keywords", [])
                volumes = [
                    kw.search_volume for kw in keywords
                    if kw.keyword in cluster_keywords and kw.search_volume
                ]
                avg_volume = sum(volumes) // len(volumes) if volumes else None
                
                clusters.append(
                    KeywordCluster(
                        cluster_id=cluster_data.get("cluster_id", idx + 1),
                        cluster_name=cluster_data.get("cluster_name", f"Cluster {idx + 1}"),
                        primary_keyword=cluster_data.get("primary_keyword", cluster_keywords[0] if cluster_keywords else ""),
                        keywords=cluster_keywords,
                        intent=intent,
                        avg_search_volume=avg_volume,
                        recommendation=cluster_data.get("recommendation")
                    )
                )
            
            return clusters
            
        except Exception as e:
            logger.error(f"Error parsing keyword clusters: {e}")
            return []
    
    async def analyze_difficulty(
        self,
        keyword: str,
        serp_features: List[str],
        competition_score: Optional[float] = None,
        search_volume: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Analyze ranking difficulty for a keyword.
        
        Args:
            keyword: Keyword to analyze
            serp_features: List of SERP features present
            competition_score: Competition score (0-1)
            search_volume: Monthly search volume
            
        Returns:
            Dictionary with difficulty analysis
        """
        # Format SERP features
        features_text = ", ".join(serp_features) if serp_features else "None"
        
        # Create chain
        chain = DIFFICULTY_ANALYSIS_PROMPT | self.llm
        
        # Run in executor
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: chain.invoke({
                "keyword": keyword,
                "serp_features": features_text,
                "competition_score": competition_score or "N/A",
                "search_volume": search_volume or "N/A"
            })
        )
        
        # Parse response
        try:
            result = self._parse_json_response(response.content)
            return result
        except Exception as e:
            logger.error(f"Error parsing difficulty analysis: {e}")
            return {
                "keyword": keyword,
                "difficulty_level": "MEDIUM",
                "difficulty_score": 50,
                "reasoning": "Unable to analyze difficulty"
            }
    
    async def generate_recommendations(
        self,
        keyword_data: List[KeywordMetrics],
        clusters: List[KeywordCluster],
        serp_insights: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate strategic recommendations based on keyword analysis.
        
        Args:
            keyword_data: List of analyzed keywords
            clusters: Keyword clusters
            serp_insights: Optional SERP analysis insights
            
        Returns:
            Dictionary with strategic recommendations
        """
        # Format data for prompt
        keywords_summary = "\n".join([
            f"- {kw.keyword}: volume={kw.search_volume}, competition={kw.competition}, intent={kw.intent}"
            for kw in keyword_data[:20]  # Limit to top 20 for token efficiency
        ])
        
        clusters_summary = "\n".join([
            f"- {cluster.cluster_name}: {len(cluster.keywords)} keywords, intent={cluster.intent}"
            for cluster in clusters
        ])
        
        serp_summary = json.dumps(serp_insights) if serp_insights else "No SERP data available"
        
        # Create chain
        chain = RECOMMENDATION_PROMPT | self.llm
        
        # Run in executor
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: chain.invoke({
                "keyword_data": keywords_summary,
                "clusters": clusters_summary,
                "serp_insights": serp_summary
            })
        )
        
        # Parse response
        try:
            result = self._parse_json_response(response.content)
            return result
        except Exception as e:
            logger.error(f"Error parsing recommendations: {e}")
            return {"overall_strategy": "Unable to generate recommendations"}
    
    async def analyze_content_gaps(
        self,
        keyword: str,
        competitor_titles: List[str],
        competitor_snippets: List[str]
    ) -> Dict[str, Any]:
        """
        Analyze content gaps based on competitor SERP data.
        
        Args:
            keyword: Target keyword
            competitor_titles: Titles from top-ranking pages
            competitor_snippets: Snippets from top-ranking pages
            
        Returns:
            Dictionary with content gap analysis
        """
        titles_text = "\n".join([f"{i+1}. {title}" for i, title in enumerate(competitor_titles)])
        snippets_text = "\n".join([f"{i+1}. {snippet}" for i, snippet in enumerate(competitor_snippets)])
        
        # Create chain
        chain = CONTENT_GAP_PROMPT | self.llm
        
        # Run in executor
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: chain.invoke({
                "keyword": keyword,
                "competitor_titles": titles_text,
                "competitor_snippets": snippets_text
            })
        )
        
        # Parse response
        try:
            result = self._parse_json_response(response.content)
            return result
        except Exception as e:
            logger.error(f"Error parsing content gaps: {e}")
            return {"common_themes": [], "content_gaps": []}
    
    def _parse_json_response(self, content: str) -> Dict[str, Any]:
        """
        Parse JSON from LLM response, handling markdown code blocks.
        """
        # Remove markdown code blocks if present
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        
        if content.endswith("```"):
            content = content[:-3]
        
        content = content.strip()
        
        # Parse JSON
        return json.loads(content)


def get_langchain_analysis_service() -> LangChainAnalysisService:
    """Factory function to create service instance"""
    return LangChainAnalysisService()

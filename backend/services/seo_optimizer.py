"""
SEO Blog Optimizer Service
Logic for analyzing articles and providing SEO recommendations.
"""

import re
import os
import logging
from typing import Optional
from bs4 import BeautifulSoup
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from schemas.seo_optimizer_schemas import SEOOptimizeRequest, SEOOptimizeResponse, SEOMetrics, InternalLinkRequest, InternalLinkResponse, SuggestedLink
from config import settings
import json

logger = logging.getLogger(__name__)


class SEOOptimizerService:
    """Service for optimizing blog posts for SEO"""

    async def optimize_article(self, request: SEOOptimizeRequest) -> SEOOptimizeResponse:
        """
        Analyze an article and return SEO metrics and recommendations.
        """
        article_content = request.article
        keyword = request.keyword.lower()
        
        # Parse HTML
        soup = BeautifulSoup(article_content, "html.parser")
        
        # 1. Word Count
        # Get text content without HTML tags for word count
        text_content = soup.get_text()
        words = text_content.split()
        word_count = len(words)
        
        # 2. Keyword Density
        # Count occurrences of keyword in text (case-insensitive)
        keyword_count = len(re.findall(f'\\b{re.escape(keyword)}\\b', text_content.lower()))
        density = (keyword_count / word_count * 100) if word_count > 0 else 0
        
        # 3. Heading Analysis
        h1_tags = soup.find_all("h1")
        h2_tags = soup.find_all("h2")
        h3_tags = soup.find_all("h3")
        
        h1_count = len(h1_tags)
        h2_count = len(h2_tags)
        h3_count = len(h3_tags)
        
        # 4. Internal Links
        # Count links starting with /blog/ or similar internal patterns
        links = soup.find_all("a", href=True)
        internal_links = sum(1 for a in links if a['href'].startswith(("/blog/", "/", "https://mysite.com/blog/")))
        
        # 5. Image SEO
        images_tags = soup.find_all("img")
        images_count = len(images_tags)
        images_without_alt = sum(1 for img in images_tags if not img.get("alt"))
        
        # Calculate Score and Recommendations
        recommendations = []
        score = 0
        
        # Word Count Rules (+15 if > 1000)
        if word_count > 1000:
            score += 15
        else:
            recommendations.append(f"Word count ({word_count}) is below the ideal 1000+ words. Consider expanding your content.")
        
        # Density Rules (+20 if 1% - 2%)
        if 1.0 <= density <= 2.0:
            score += 20
        elif density < 1.0:
            recommendations.append(f"Keyword density ({density:.2f}%) is low. Use the keyword '{request.keyword}' 3–5 more times to improve relevance.")
        elif density > 2.5:
            recommendations.append(f"Keyword density ({density:.2f}%) is too high (keyword stuffing). Reduce keyword usage for better readability.")
        
        # Meta Description Rules (+10 if exists)
        if request.meta_description and len(request.meta_description.strip()) > 0:
            score += 10
            if len(request.meta_description) < 150 or len(request.meta_description) > 160:
                recommendations.append("Adjust meta description length to be between 150-160 characters for optimal display.")
        else:
            recommendations.append("Add a meta description (150-160 characters) to improve click-through rates.")

        # Heading Rules
        # H1 Rules (+10 if exactly 1)
        if h1_count == 1:
            score += 10
        elif h1_count == 0:
            recommendations.append("Missing H1 tag. Ensure you have exactly one H1 tag.")
        else:
            recommendations.append(f"Found {h1_count} H1 tags. Use only one H1 tag per page for clear hierarchy.")
            
        # H2 Rules (+15 if >= 2)
        if h2_count >= 2:
            score += 15
        else:
            recommendations.append(f"Found only {h2_count} H2 tags. Add at least 2 H2 headings to structure your content better.")
            
        # Link Rules (+15 if >= 2)
        if internal_links >= 2:
            score += 15
        else:
            recommendations.append(f"Found {internal_links} internal links. Add internal links to related articles (at least 2 recommended).")
            
        # Image Rules (+15 if images exist and all have alt)
        if images_count > 0:
            if images_without_alt == 0:
                score += 15
            else:
                recommendations.append(f"{images_without_alt} images are missing alt text. Add descriptive alt tags to all images.")
        else:
            recommendations.append("Consider adding images with descriptive alt text to make your content more engaging.")

        # Title check (extra context, though not in the user's specific +score table, good for refinement)
        if not request.title:
            recommendations.append("Missing SEO Title. Add a compelling title (30-60 characters).")

        # Cap score
        score = min(100, score)

        # Generate AI Insights
        ai_insights = await self._generate_ai_insights(request, word_count, density)
        
        metrics = SEOMetrics(
            word_count=word_count,
            keyword_density=round(density, 2),
            h1_count=h1_count,
            h2_count=h2_count,
            h3_count=h3_count,
            internal_links=internal_links,
            images=images_count,
            images_without_alt=images_without_alt
        )
        
        return SEOOptimizeResponse(
            seo_score=score,
            metrics=metrics,
            recommendations=recommendations,
            ai_insights=ai_insights
        )

    async def _generate_ai_insights(self, request: SEOOptimizeRequest, word_count: int, density: float) -> Optional[str]:
        """
        Generate qualitative AI insights using Gemini.
        """
        if not settings.gemini_api_key:
            logger.warning("Gemini API key not configured. Skipping AI insights.")
            return "AI Insights are currently unavailable. Please configure the Gemini API key."

        try:
            llm = ChatGoogleGenerativeAI(
                api_key=settings.gemini_api_key,
                model=settings.gemini_model,
                temperature=0.4
            )

            prompt = f"""
            You are a Senior SEO Content Strategist. Analyze the following blog post details and provide high-level, actionable AI insights beyond simple metrics.
            
            Target Keyword: {request.keyword}
            SEO Title: {request.title or 'Not provided'}
            Meta Description: {request.meta_description or 'Not provided'}
            Word Count: {word_count}
            Keyword Density: {density:.2f}%
            
            Article Content (Snippet):
            {request.article[:2000]}
            
            Provide your analysis in the following Markdown format:
            ### 🎯 Semantic Opportunities
            (Suggest 3-5 LSI/Semantic keywords to include)
            
            ### ✍️ Content Quality & Flow
            (Briefly comment on readability and expertise)
            
            ### 💡 Advanced Strategy
            (One high-level tip like internal link anchor text or featured snippet optimization)
            
            Keep the response concise and professional.
            """

            message = HumanMessage(content=prompt)
            # Use run_in_executor if the method is not natively async (but ChatGoogleGenerativeAI.invoke is sync)
            import asyncio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: llm.invoke([message]))
            
            return response.content

        except Exception as e:
            logger.error(f"Error generating AI insights: {e}")
            return "Failed to generate AI insights. Using standard technical metrics only."

    async def suggest_internal_links(self, request: InternalLinkRequest) -> InternalLinkResponse:
        """
        Extract topics from the article and match them to existing blog titles to suggest internal links.
        Utilizes Gemini for semantic matching and intelligent anchor text generation.
        """
        if not settings.gemini_api_key:
            raise ValueError("Gemini API key not configured. Cannot generate semantic link suggestions.")

        if not request.existing_titles:
            return InternalLinkResponse(suggestions=[])

        try:
            llm = ChatGoogleGenerativeAI(
                api_key=settings.gemini_api_key,
                model=settings.gemini_model,
                temperature=0.2
            )
            
            # Format the titles as a bulleted list string
            titles_str = "\n".join([f"- {title}" for title in request.existing_titles])
            
            # Truncate article to fit in context window comfortably
            truncated_article = request.article[:5000]

            prompt = f"""
            You are an expert SEO Link Building Agent.
            Your task is to analyze an article and suggest highly relevant internal links from a provided list of existing blog titles.
            
            Existing Blog Titles:
            {titles_str}
            
            Article Content (Snippet):
            {truncated_article}
            
            Instructions:
            1. Identify 2 to 5 highly relevant topical connections between the article content and the existing blog titles.
            2. Suggest natural, contextually relevant anchor text that ideally exists (or could easily be placed) within the article.
            3. Explain briefly why the link is a strong semantic match.
            4. Only suggest a link if there is a strong thematic connection.
            
            You MUST return ONLY a valid JSON array of objects. Do not include markdown formatting like ```json.
            Example format:
            [
              {{
                "target_title": "Existing Title 1",
                "suggested_anchor_text": "understanding SEO basics",
                "reasoning": "The article discusses basics, making this a perfect semantic bridge."
              }}
            ]
            """

            message = HumanMessage(content=prompt)
            import asyncio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: llm.invoke([message]))
            
            # Parse the JSON response
            content = response.content.strip()
            # Clean up markdown code blocks if the LLM hallucinated them despite instructions
            content = re.sub(r'^```json\s*', '', content)
            content = re.sub(r'^```\s*', '', content)
            content = re.sub(r'\s*```$', '', content)
            
            suggestions_data = json.loads(content)
            
            # Parse into Pydantic models
            suggestions = []
            for item in suggestions_data:
                # Ensure the suggested title actually exists to prevent hallucinations
                matched_title = item.get("target_title", "")
                if any(matched_title.lower() == t.lower() for t in request.existing_titles):
                    suggestions.append(
                        SuggestedLink(
                            target_title=matched_title,
                            suggested_anchor_text=item.get("suggested_anchor_text", ""),
                            reasoning=item.get("reasoning", "")
                        )
                    )
                    
            return InternalLinkResponse(suggestions=suggestions)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini JSON response for internal links: {e}")
            return InternalLinkResponse(suggestions=[])
        except Exception as e:
            logger.error(f"Error suggesting internal links: {e}")
            raise



_seo_optimizer_service = None

def get_seo_optimizer_service() -> SEOOptimizerService:
    """Get or create singleton instance of SEOOptimizerService"""
    global _seo_optimizer_service
    if _seo_optimizer_service is None:
        _seo_optimizer_service = SEOOptimizerService()
    return _seo_optimizer_service

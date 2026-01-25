"""
LangChain Prompt Templates for Keyword Analysis
"""

from langchain_core.prompts import PromptTemplate


# ============= Intent Classification =============

INTENT_CLASSIFICATION_PROMPT = PromptTemplate(
    input_variables=["keywords"],
    template="""You are an SEO expert analyzing search intent.

Classify each of the following keywords into one of these intent categories:
- INFORMATIONAL: User wants to learn or find information
- COMMERCIAL: User is researching products/services before purchase
- TRANSACTIONAL: User is ready to buy or take action
- NAVIGATIONAL: User wants to find a specific website or page

Keywords to classify:
{keywords}

Return your response as a JSON object with this structure:
{{
    "classifications": [
        {{"keyword": "example keyword", "intent": "INFORMATIONAL", "confidence": 0.95, "reasoning": "brief explanation"}},
        ...
    ]
}}

Be concise but accurate. Consider modifiers like "how to", "best", "buy", "near me", etc.
"""
)


# ============= Keyword Clustering =============

KEYWORD_CLUSTERING_PROMPT = PromptTemplate(
    input_variables=["keywords", "num_clusters"],
    template="""You are an SEO expert grouping keywords into semantic clusters.

Analyze these keywords and group them into {num_clusters} thematic clusters based on:
- Semantic similarity
- Search intent alignment
- Topic relevance
- Content strategy fit

Keywords to cluster:
{keywords}

For each cluster:
1. Assign a descriptive name/theme
2. Identify the primary keyword (highest volume or most representative)
3. Group related keywords
4. Suggest a content strategy for that cluster

Return your response as a JSON object:
{{
    "clusters": [
        {{
            "cluster_id": 1,
            "cluster_name": "Descriptive Theme Name",
            "primary_keyword": "main keyword",
            "keywords": ["keyword1", "keyword2", ...],
            "intent": "INFORMATIONAL|COMMERCIAL|TRANSACTIONAL|NAVIGATIONAL",
            "recommendation": "Brief content strategy suggestion"
        }},
        ...
    ],
    "unclustered": ["keyword1", "keyword2"]
}}

If a keyword doesn't fit any cluster well, add it to "unclustered".
"""
)


# ============= Difficulty Analysis =============

DIFFICULTY_ANALYSIS_PROMPT = PromptTemplate(
    input_variables=["keyword", "serp_features", "competition_score", "search_volume"],
    template="""You are an SEO expert estimating keyword ranking difficulty.

Analyze this keyword and estimate how difficult it would be to rank in the top 10:

Keyword: {keyword}
Search Volume: {search_volume}
Competition Score: {competition_score} (0-1 scale)
SERP Features Present: {serp_features}

Consider these factors:
1. Search volume (higher = more competitive)
2. Competition score from Google Ads
3. SERP features (featured snippets, knowledge panels increase difficulty)
4. Keyword length (longer tail = easier)
5. Commercial intent (transactional keywords often harder)

Return a JSON object:
{{
    "keyword": "{keyword}",
    "difficulty_level": "VERY_EASY|EASY|MEDIUM|HARD|VERY_HARD",
    "difficulty_score": 0-100,
    "reasoning": "Brief explanation of the difficulty assessment",
    "ranking_factors": [
        "Factor 1: explanation",
        "Factor 2: explanation"
    ],
    "estimated_time_to_rank": "e.g., 3-6 months for a new domain"
}}
"""
)


# ============= Strategic Recommendations =============

RECOMMENDATION_PROMPT = PromptTemplate(
    input_variables=["keyword_data", "clusters", "serp_insights"],
    template="""You are an SEO strategist providing actionable recommendations.

Based on this keyword research data, provide strategic recommendations:

Keyword Analysis:
{keyword_data}

Keyword Clusters:
{clusters}

SERP Insights:
{serp_insights}

Provide recommendations covering:
1. **Priority Keywords**: Which keywords to target first and why
2. **Content Strategy**: What type of content to create for each cluster
3. **Quick Wins**: Low-difficulty, high-value opportunities
4. **Long-term Targets**: High-value keywords worth the investment
5. **Content Gaps**: Opportunities based on competitor analysis
6. **SERP Feature Opportunities**: Which features to target (featured snippets, PAA, etc.)

Return a JSON object:
{{
    "priority_keywords": [
        {{"keyword": "example", "reason": "why prioritize", "difficulty": "EASY|MEDIUM|HARD"}}
    ],
    "content_strategy": [
        {{
            "cluster": "cluster name",
            "content_type": "blog post|landing page|guide|etc",
            "recommended_approach": "detailed strategy"
        }}
    ],
    "quick_wins": ["keyword1", "keyword2"],
    "long_term_targets": ["keyword1", "keyword2"],
    "serp_opportunities": [
        {{"feature": "featured_snippet", "keywords": ["kw1", "kw2"], "approach": "how to target"}}
    ],
    "overall_strategy": "High-level strategic summary in 2-3 sentences"
}}

Be specific and actionable. Focus on practical next steps.
"""
)


# ============= SERP Content Gap Analysis =============

CONTENT_GAP_PROMPT = PromptTemplate(
    input_variables=["keyword", "competitor_titles", "competitor_snippets"],
    template="""You are an SEO analyst identifying content gaps and opportunities.

Analyze the top-ranking content for this keyword:

Keyword: {keyword}

Top Ranking Titles:
{competitor_titles}

Top Ranking Snippets:
{competitor_snippets}

Identify:
1. Common themes and topics covered by competitors
2. Content gaps - topics NOT well covered
3. Unique angles or perspectives to differentiate
4. Content format opportunities (listicles, how-tos, comparisons, etc.)

Return a JSON object:
{{
    "common_themes": ["theme1", "theme2"],
    "content_gaps": [
        {{"gap": "missing topic", "opportunity": "why this is valuable"}}
    ],
    "unique_angles": ["angle1", "angle2"],
    "recommended_format": "blog post|guide|comparison|listicle|video|etc",
    "content_outline": [
        "Section 1: Title",
        "Section 2: Title"
    ]
}}
"""
)

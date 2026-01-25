/**
 * API Client for Keyword Research
 * Type-safe client for interacting with the SEO Suite backend
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============= Types =============

export enum SearchIntent {
    INFORMATIONAL = 'informational',
    COMMERCIAL = 'commercial',
    TRANSACTIONAL = 'transactional',
    NAVIGATIONAL = 'navigational',
    UNKNOWN = 'unknown',
}

export enum DifficultyLevel {
    VERY_EASY = 'very_easy',
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
    VERY_HARD = 'very_hard',
}

export enum CompetitionLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    UNKNOWN = 'unknown',
}

export interface KeywordSuggestion {
    keyword: string;
    search_volume?: number;
    competition?: CompetitionLevel;
    competition_score?: number;
    cpc?: number;
    trend?: string;
    source: string;
}

export interface KeywordMetrics {
    keyword: string;
    search_volume?: number;
    competition?: CompetitionLevel;
    competition_score?: number;
    cpc?: number;
    intent?: SearchIntent;
    difficulty?: DifficultyLevel;
    difficulty_score?: number;
    trending?: boolean;
    seasonality?: string;
    related_keywords?: string[];
}

export interface KeywordCluster {
    cluster_id: number;
    cluster_name: string;
    primary_keyword: string;
    keywords: string[];
    intent?: SearchIntent;
    avg_search_volume?: number;
    recommendation?: string;
}

export interface KeywordSuggestionsResponse {
    seed_keyword: string;
    total_suggestions: number;
    suggestions: KeywordSuggestion[];
    data_sources: string[];
    cached: boolean;
}

export interface KeywordAnalysisResponse {
    seed_keyword: string;
    keywords: KeywordMetrics[];
    clusters?: KeywordCluster[];
    insights?: any;
    total_keywords: number;
    data_sources: string[];
    cached: boolean;
}

export interface SERPAnalysisResponse {
    keyword: string;
    total_results: number;
    organic_results: any[];
    features: any[];
    people_also_ask: any[];
    related_searches: any[];
    serp_api_used: string;
    cached: boolean;
    insights?: any;
}

// ============= API Client =============

class KeywordAPIClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Get keyword suggestions
     */
    async getSuggestions(
        seedKeyword: string,
        limit: number = 20,
        language: string = 'en',
        country: string = 'us'
    ): Promise<KeywordSuggestionsResponse> {
        const response = await fetch(`${this.baseUrl}/api/v1/keywords/suggest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                seed_keyword: seedKeyword,
                limit,
                language,
                country,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Complete keyword analysis
     */
    async analyzeKeywords(
        seedKeyword: string,
        options: {
            includeSuggestions?: boolean;
            includeVolume?: boolean;
            includeSerp?: boolean;
            includeClustering?: boolean;
            limit?: number;
            language?: string;
            country?: string;
        } = {}
    ): Promise<KeywordAnalysisResponse> {
        const {
            includeSuggestions = true,
            includeVolume = true,
            includeSerp = true,
            includeClustering = true,
            limit = 20,
            language = 'en',
            country = 'us',
        } = options;

        const response = await fetch(`${this.baseUrl}/api/v1/keywords/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                seed_keyword: seedKeyword,
                include_suggestions: includeSuggestions,
                include_volume: includeVolume,
                include_serp: includeSerp,
                include_clustering: includeClustering,
                limit,
                language,
                country,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Cluster keywords
     */
    async clusterKeywords(
        keywords: string[],
        numClusters?: number
    ): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/keywords/cluster`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                keywords,
                num_clusters: numClusters,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get single keyword metrics
     */
    async getKeywordMetrics(
        keyword: string,
        language: string = 'en',
        country: string = 'us'
    ): Promise<KeywordMetrics> {
        const response = await fetch(
            `${this.baseUrl}/api/v1/keywords/${encodeURIComponent(keyword)}/metrics?language=${language}&country=${country}`
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Analyze SERP
     */
    async analyzeSERP(
        keyword: string,
        language: string = 'en',
        country: string = 'us',
        device: string = 'desktop',
        numResults: number = 10
    ): Promise<SERPAnalysisResponse> {
        const response = await fetch(`${this.baseUrl}/api/v1/serp/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                keyword,
                language,
                country,
                device,
                num_results: numResults,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Analyze competitors
     */
    async analyzeCompetitors(
        keyword: string,
        language: string = 'en',
        country: string = 'us',
        topN: number = 10
    ): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/serp/competitors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                keyword,
                language,
                country,
                top_n: topN,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }
}

// Export singleton instance
export const keywordAPI = new KeywordAPIClient();

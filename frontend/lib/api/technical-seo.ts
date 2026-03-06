/**
 * API Client for Technical SEO Audit
 * Type-safe client for interacting with the SEO Suite backend
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============= Types =============

export enum SEOStatus {
    PASS = 'pass',
    WARNING = 'warning',
    ERROR = 'error',
    INFO = 'info',
}

export interface TitleTagCheck {
    content?: string;
    length: number;
    status: SEOStatus;
    recommendations: string[];
}

export interface MetaDescriptionCheck {
    content?: string;
    length: number;
    status: SEOStatus;
    recommendations: string[];
}

export interface HeadingStructure {
    tag: string;
    text: string;
    order: number;
}

export interface HeadingStructureCheck {
    h1_count: number;
    h2_count: number;
    h3_count: number;
    h4_count: number;
    h5_count: number;
    h6_count: number;
    headings: HeadingStructure[];
    has_multiple_h1: boolean;
    hierarchy_issues: string[];
    status: SEOStatus;
    recommendations: string[];
}

export interface ImageWithoutAlt {
    src: string;
    tag_type: string;
    context?: string;
}

export interface AltTagCheck {
    total_images: number;
    images_with_alt: number;
    images_without_alt: number;
    missing_alt_images: ImageWithoutAlt[];
    status: SEOStatus;
    recommendations: string[];
}

export interface CanonicalTagCheck {
    present: boolean;
    href?: string;
    is_self_referencing?: boolean;
    status: SEOStatus;
    recommendations: string[];
}

export interface RobotsMetaCheck {
    present: boolean;
    content?: string;
    noindex: boolean;
    nofollow: boolean;
    status: SEOStatus;
    recommendations: string[];
}

export interface OpenGraphTag {
    property: string;
    content: string;
}

export interface OpenGraphCheck {
    present: boolean;
    tags: OpenGraphTag[];
    has_og_title: boolean;
    has_og_description: boolean;
    has_og_image: boolean;
    has_og_url: boolean;
    has_og_type: boolean;
    missing_essential: string[];
    status: SEOStatus;
    recommendations: string[];
}

export interface TwitterCardTag {
    name: string;
    content: string;
}

export interface TwitterCardCheck {
    present: boolean;
    tags: TwitterCardTag[];
    has_card: boolean;
    has_title: boolean;
    has_description: boolean;
    has_image: boolean;
    status: SEOStatus;
    recommendations: string[];
}

export interface BrokenLink {
    url: string;
    anchor_text?: string;
    status_code?: number;
    error?: string;
}

export interface InternalLinksCheck {
    total_internal_links: number;
    unique_internal_links: number;
    broken_links: BrokenLink[];
    status: SEOStatus;
    recommendations: string[];
}

export interface ImageSizeIssue {
    src: string;
    width?: number;
    height?: number;
    file_size_kb?: number;
    issue: string;
}

export interface ImageSizeCheck {
    total_images: number;
    oversized_images: ImageSizeIssue[];
    images_without_dimensions: string[];
    status: SEOStatus;
    recommendations: string[];
}

export interface PageLoadTimeCheck {
    load_time_seconds: number;
    status: SEOStatus;
    recommendations: string[];
    metrics?: Record<string, any>;
}

export interface StructuredDataCheck {
    present: boolean;
    types: string[];
    json_ld_scripts: string[];
    microdata_count: number;
    rdfa_count: number;
    status: SEOStatus;
    recommendations: string[];
}

export interface SecurityCheck {
    is_https: boolean;
    mixed_content: boolean;
    status: SEOStatus;
    recommendations: string[];
}

export interface MobileFriendlyCheck {
    viewport_meta: boolean;
    media_queries_detected: boolean;
    status: SEOStatus;
    recommendations: string[];
}

export interface MetaCharsetCheck {
    present: boolean;
    charset?: string;
    status: SEOStatus;
}

export interface ViewportCheck {
    present: boolean;
    content?: string;
    status: SEOStatus;
}

export interface LanguageCheck {
    lang_attribute?: string;
    hreflang_tags: Record<string, string>[];
    status: SEOStatus;
    recommendations: string[];
}

export interface URLStructureCheck {
    url: string;
    is_seo_friendly: boolean;
    has_underscores: boolean;
    has_uppercase: boolean;
    has_special_chars: boolean;
    issues: string[];
    status: SEOStatus;
}

export interface TechnicalSEOAuditRequest {
    url: string;
    user_agent?: string;
    check_broken_links?: boolean;
    max_links_to_check?: number;
    timeout_seconds?: number;
    follow_redirects?: boolean;
}

export interface TechnicalSEOAuditResponse {
    url: string;
    final_url?: string;
    audit_timestamp: string;

    // Core SEO Elements
    title_tag: TitleTagCheck;
    meta_description: MetaDescriptionCheck;
    headings: HeadingStructureCheck;

    // Technical Elements
    canonical_tag: CanonicalTagCheck;
    robots_meta: RobotsMetaCheck;
    open_graph: OpenGraphCheck;
    twitter_cards: TwitterCardCheck;

    // Content Analysis
    alt_tags: AltTagCheck;
    images: ImageSizeCheck;

    // Links
    internal_links: InternalLinksCheck;

    // Performance
    page_load_time: PageLoadTimeCheck;

    // Additional Checks
    structured_data: StructuredDataCheck;
    security: SecurityCheck;
    mobile_friendly: MobileFriendlyCheck;
    charset: MetaCharsetCheck;
    viewport: ViewportCheck;
    language: LanguageCheck;
    url_structure: URLStructureCheck;

    // Summary
    overall_score: number;
    critical_issues: string[];
    warnings: string[];
    passed_checks: number;
    total_checks: number;

    // Metadata
    http_status: number;
    content_type?: string;
    server?: string;
    html_size_kb?: number;
}

export interface QuickAuditRequest {
    url: string;
    timeout_seconds?: number;
}

export interface QuickAuditResponse {
    url: string;
    audit_timestamp: string;
    title_tag: TitleTagCheck;
    meta_description: MetaDescriptionCheck;
    headings: HeadingStructureCheck;
    canonical_tag: CanonicalTagCheck;
    robots_meta: RobotsMetaCheck;
    alt_tags: AltTagCheck;
    overall_score: number;
    critical_issues: string[];
    http_status: number;
    page_load_time_seconds?: number;
}

// ============= API Client =============

class TechnicalSEOAPIClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Perform a full technical SEO audit
     */
    async auditUrl(
        url: string,
        options: {
            checkBrokenLinks?: boolean;
            maxLinksToCheck?: number;
            timeoutSeconds?: number;
            followRedirects?: boolean;
        } = {}
    ): Promise<TechnicalSEOAuditResponse> {
        const {
            checkBrokenLinks = true,
            maxLinksToCheck = 50,
            timeoutSeconds = 30,
            followRedirects = true,
        } = options;

        const response = await fetch(`${this.baseUrl}/api/v1/technical-seo/audit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
                check_broken_links: checkBrokenLinks,
                max_links_to_check: maxLinksToCheck,
                timeout_seconds: timeoutSeconds,
                follow_redirects: followRedirects,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Perform a quick SEO audit (essential checks only)
     */
    async quickAudit(
        url: string,
        timeoutSeconds: number = 15
    ): Promise<QuickAuditResponse> {
        const response = await fetch(`${this.baseUrl}/api/v1/technical-seo/quick-audit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
                timeout_seconds: timeoutSeconds,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Quick GET audit (lightweight, no broken link checking)
     */
    async quickAuditGet(url: string): Promise<TechnicalSEOAuditResponse> {
        const encodedUrl = encodeURIComponent(url);
        const response = await fetch(`${this.baseUrl}/api/v1/technical-seo/audit/${encodedUrl}`);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }
}

// Export singleton instance
export const technicalSEOAPI = new TechnicalSEOAPIClient();

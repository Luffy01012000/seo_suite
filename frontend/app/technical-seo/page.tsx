'use client';

import { useState } from 'react';
import { technicalSEOAPI, TechnicalSEOAuditResponse, SEOStatus } from '@/lib/api/technical-seo';
import {
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Globe,
  Type,
  Heading1,
  Image as ImageIcon,
  Link as LinkIcon,
  Clock,
  Shield,
  Smartphone,
  Code,
  FileCode,
  Tag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { cn } from '@/lib/utils';

// Helper to get status color
const getStatusColor = (status: SEOStatus) => {
  switch (status) {
    case 'pass':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'warning':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'error':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    case 'info':
    default:
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  }
};

const getStatusIcon = (status: SEOStatus) => {
  switch (status) {
    case 'pass':
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-400" />;
    case 'info':
    default:
      return <Info className="w-5 h-5 text-blue-400" />;
  }
};

// Score color helper
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-emerald-500/20';
  if (score >= 60) return 'bg-amber-500/20';
  return 'bg-red-500/20';
};

interface CheckCardProps {
  title: string;
  icon: React.ReactNode;
  status: SEOStatus;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CheckCard = ({ title, icon, status, children, defaultExpanded = false }: CheckCardProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", getStatusColor(status))}>
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">{title}</h3>
            <span className={cn("text-sm capitalize",
              status === 'pass' ? 'text-emerald-400' :
              status === 'warning' ? 'text-amber-400' :
              status === 'error' ? 'text-red-400' : 'text-blue-400'
            )}>
              {status}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  );
};

export default function TechnicalSEOPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TechnicalSEOAuditResponse | null>(null);

  const handleAudit = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Add https:// if not present
    let auditUrl = url.trim();
    if (!auditUrl.startsWith('http://') && !auditUrl.startsWith('https://')) {
      auditUrl = 'https://' + auditUrl;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await technicalSEOAPI.auditUrl(auditUrl, {
        checkBrokenLinks: true,
        maxLinksToCheck: 30,
      });
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform audit');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAudit = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    let auditUrl = url.trim();
    if (!auditUrl.startsWith('http://') && !auditUrl.startsWith('https://')) {
      auditUrl = 'https://' + auditUrl;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const quickData = await technicalSEOAPI.quickAudit(auditUrl);
      
      // Construct a compatible response for the UI from quick audit results
      // This maps the lightweight QuickAuditResponse to the full TechnicalSEOAuditResponse structure
      const fullResults: TechnicalSEOAuditResponse = {
        ...quickData,
        final_url: quickData.url,
        page_load_time: {
          load_time_seconds: quickData.page_load_time_seconds || 0,
          status: SEOStatus.INFO,
          recommendations: ['Load time estimation from quick audit'],
        },
        // Fill in defaults for missing sections expected by the UI
        open_graph: { present: false, tags: [], has_og_title: false, has_og_description: false, has_og_image: false, has_og_url: false, has_og_type: false, missing_essential: [], status: SEOStatus.INFO, recommendations: ['Check social tags in a full audit'] },
        twitter_cards: { present: false, tags: [], has_card: false, has_title: false, has_description: false, has_image: false, status: SEOStatus.INFO, recommendations: ['Check Twitter tags in a full audit'] },
        images: { 
          total_images: quickData.alt_tags.total_images, 
          oversized_images: [], 
          images_without_dimensions: [], 
          status: quickData.alt_tags.status, 
          recommendations: ['Detailed image analysis skipped in Quick Audit'] 
        },
        internal_links: { 
          total_internal_links: 0, 
          unique_internal_links: 0, 
          broken_links: [], 
          status: SEOStatus.INFO, 
          recommendations: ['Link checking skipped in Quick Audit'] 
        },
        structured_data: { present: false, types: [], json_ld_scripts: [], microdata_count: 0, rdfa_count: 0, status: SEOStatus.INFO, recommendations: ['Structured data check skipped'] },
        security: { is_https: auditUrl.startsWith('https'), mixed_content: false, status: SEOStatus.INFO, recommendations: ['Security scan skipped'] },
        mobile_friendly: { viewport_meta: false, media_queries_detected: false, status: SEOStatus.INFO, recommendations: ['Mobile check skipped'] },
        charset: { present: false, status: SEOStatus.INFO },
        viewport: { present: false, status: SEOStatus.INFO },
        language: { hreflang_tags: [], status: SEOStatus.INFO, recommendations: [] },
        url_structure: { url: auditUrl, is_seo_friendly: true, has_underscores: false, has_uppercase: false, has_special_chars: false, issues: [], status: SEOStatus.INFO },
        warnings: [],
        passed_checks: 0, 
        total_checks: 6, // Title, Meta, Headings, Canonical, Robots, Alt Tags
      };
      
      setResults(fullResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform audit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Technical SEO Audit
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Analyze any webpage for technical SEO issues. Get instant insights on title tags,
              meta descriptions, headings, images, links, and more.
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL (e.g., example.com)"
                  className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleAudit()}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleQuickAudit}
                  disabled={loading}
                  className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
                  Quick
                </button>
                <button
                  onClick={handleAudit}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Auditing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Full Audit
                    </>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          {results && (
            <div className="space-y-8">
              {/* Overall Score */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Score Circle */}
                  <div className={cn(
                    "w-32 h-32 rounded-full flex items-center justify-center border-4",
                    getScoreBg(results.overall_score),
                    results.overall_score >= 80 ? 'border-emerald-500' :
                    results.overall_score >= 60 ? 'border-amber-500' : 'border-red-500'
                  )}>
                    <div className="text-center">
                      <div className={cn("text-4xl font-bold", getScoreColor(results.overall_score))}>
                        {results.overall_score}
                      </div>
                      <div className="text-sm text-gray-400">Score</div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Audit Results for {new URL(results.final_url || results.url).hostname}
                    </h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {results.passed_checks} Passed
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {results.warnings.length} Warnings
                      </span>
                      <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        {results.critical_issues.length} Critical
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Load: {results.page_load_time.load_time_seconds.toFixed(2)}s
                      </span>
                    </div>
                  </div>

                  {/* URL Info */}
                  <div className="text-right text-sm text-gray-400">
                    <div>HTTP {results.http_status}</div>
                    {results.html_size_kb && <div>{results.html_size_kb.toFixed(1)} KB</div>}
                  </div>
                </div>

                {/* Critical Issues */}
                {results.critical_issues.length > 0 && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Critical Issues ({results.critical_issues.length})
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {results.critical_issues.slice(0, 5).map((issue, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          {issue}
                        </li>
                      ))}
                      {results.critical_issues.length > 5 && (
                        <li className="text-gray-500">...and {results.critical_issues.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Check Cards Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Title Tag */}
                <CheckCard
                  title="Title Tag"
                  icon={<Type className="w-5 h-5" />}
                  status={results.title_tag.status}
                  defaultExpanded={results.title_tag.status !== 'pass'}
                >
                  <div className="mt-4 space-y-3">
                    {results.title_tag.content && (
                      <div className="p-3 bg-slate-950/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Content:</div>
                        <div className="text-white">{results.title_tag.content}</div>
                      </div>
                    )}
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400">Length: <span className="text-white">{results.title_tag.length}</span> chars</span>
                    </div>
                    {results.title_tag.recommendations.length > 0 && (
                      <ul className="space-y-1 text-sm">
                        {results.title_tag.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-300">
                            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CheckCard>

                {/* Meta Description */}
                <CheckCard
                  title="Meta Description"
                  icon={<FileCode className="w-5 h-5" />}
                  status={results.meta_description.status}
                  defaultExpanded={results.meta_description.status !== 'pass'}
                >
                  <div className="mt-4 space-y-3">
                    {results.meta_description.content && (
                      <div className="p-3 bg-slate-950/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Content:</div>
                        <div className="text-white text-sm">{results.meta_description.content}</div>
                      </div>
                    )}
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400">Length: <span className="text-white">{results.meta_description.length}</span> chars</span>
                    </div>
                    {results.meta_description.recommendations.length > 0 && (
                      <ul className="space-y-1 text-sm">
                        {results.meta_description.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-300">
                            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CheckCard>

                {/* Headings */}
                <CheckCard
                  title="Heading Structure"
                  icon={<Heading1 className="w-5 h-5" />}
                  status={results.headings.status}
                  defaultExpanded={results.headings.status !== 'pass'}
                >
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="px-2 py-1 bg-slate-950/50 rounded text-gray-300">H1: {results.headings.h1_count}</span>
                      <span className="px-2 py-1 bg-slate-950/50 rounded text-gray-300">H2: {results.headings.h2_count}</span>
                      <span className="px-2 py-1 bg-slate-950/50 rounded text-gray-300">H3: {results.headings.h3_count}</span>
                      <span className="px-2 py-1 bg-slate-950/50 rounded text-gray-300">H4: {results.headings.h4_count}</span>
                    </div>
                    {results.headings.has_multiple_h1 && (
                      <div className="text-amber-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Multiple H1 tags detected
                      </div>
                    )}
                    {results.headings.hierarchy_issues.length > 0 && (
                      <ul className="space-y-1 text-sm">
                        {results.headings.hierarchy_issues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2 text-amber-400">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    )}
                    {results.headings.headings.length > 0 && (
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {results.headings.headings.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              h.tag === 'h1' ? 'bg-purple-500/20 text-purple-400' :
                              h.tag === 'h2' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            )}>
                              {h.tag}
                            </span>
                            <span className="text-gray-300 truncate">{h.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CheckCard>

                {/* Alt Tags */}
                <CheckCard
                  title="Image Alt Tags"
                  icon={<ImageIcon className="w-5 h-5" />}
                  status={results.alt_tags.status}
                  defaultExpanded={results.alt_tags.status !== 'pass'}
                >
                  <div className="mt-4 space-y-3">
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400">Total: <span className="text-white">{results.alt_tags.total_images}</span></span>
                      <span className="text-emerald-400">With alt: {results.alt_tags.images_with_alt}</span>
                      <span className="text-red-400">Missing: {results.alt_tags.images_without_alt}</span>
                    </div>
                    {results.alt_tags.missing_alt_images.length > 0 && (
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {results.alt_tags.missing_alt_images.map((img, i) => (
                          <div key={i} className="text-xs text-gray-400 truncate">
                            {img.src}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CheckCard>

                {/* Canonical */}
                <CheckCard
                  title="Canonical Tag"
                  icon={<Tag className="w-5 h-5" />}
                  status={results.canonical_tag.status}
                >
                  <div className="mt-4 space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-400">Present: </span>
                      <span className={results.canonical_tag.present ? 'text-emerald-400' : 'text-amber-400'}>
                        {results.canonical_tag.present ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {results.canonical_tag.href && (
                      <div className="p-2 bg-slate-950/50 rounded text-xs text-gray-300 break-all">
                        {results.canonical_tag.href}
                      </div>
                    )}
                  </div>
                </CheckCard>

                {/* Robots Meta */}
                <CheckCard
                  title="Robots Meta"
                  icon={<Shield className="w-5 h-5" />}
                  status={results.robots_meta.status}
                >
                  <div className="mt-4 space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-400">Present: </span>
                      <span className={results.robots_meta.present ? 'text-white' : 'text-gray-500'}>
                        {results.robots_meta.present ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {results.robots_meta.noindex && (
                      <div className="text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Page has noindex directive!
                      </div>
                    )}
                    {results.robots_meta.nofollow && (
                      <div className="text-amber-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Page has nofollow directive
                      </div>
                    )}
                  </div>
                </CheckCard>

                {/* Open Graph */}
                <CheckCard
                  title="Open Graph Tags"
                  icon={<ExternalLink className="w-5 h-5" />}
                  status={results.open_graph.status}
                >
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={cn("px-2 py-1 rounded", results.open_graph.has_og_title ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500')}>og:title</span>
                      <span className={cn("px-2 py-1 rounded", results.open_graph.has_og_description ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500')}>og:description</span>
                      <span className={cn("px-2 py-1 rounded", results.open_graph.has_og_image ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500')}>og:image</span>
                      <span className={cn("px-2 py-1 rounded", results.open_graph.has_og_url ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500')}>og:url</span>
                      <span className={cn("px-2 py-1 rounded", results.open_graph.has_og_type ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500')}>og:type</span>
                    </div>
                    {results.open_graph.missing_essential.length > 0 && (
                      <div className="text-amber-400 text-sm">
                        Missing: {results.open_graph.missing_essential.join(', ')}
                      </div>
                    )}
                  </div>
                </CheckCard>

                {/* Internal Links */}
                <CheckCard
                  title="Internal Links"
                  icon={<LinkIcon className="w-5 h-5" />}
                  status={results.internal_links.status}
                  defaultExpanded={results.internal_links.broken_links.length > 0}
                >
                  <div className="mt-4 space-y-3">
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400">Total: <span className="text-white">{results.internal_links.total_internal_links}</span></span>
                      <span className="text-gray-400">Unique: <span className="text-white">{results.internal_links.unique_internal_links}</span></span>
                    </div>
                    {results.internal_links.broken_links.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-red-400 text-sm font-medium">
                          {results.internal_links.broken_links.length} broken links found:
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {results.internal_links.broken_links.map((link, i) => (
                            <div key={i} className="text-xs text-gray-400 truncate">
                               {link.url} {link.status_code ? `(${link.status_code})` : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CheckCard>

                {/* Security */}
                <CheckCard
                  title="Security"
                  icon={<Shield className="w-5 h-5" />}
                  status={results.security.status}
                >
                  <div className="mt-4 space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-400">HTTPS: </span>
                      <span className={results.security.is_https ? 'text-emerald-400' : 'text-red-400'}>
                        {results.security.is_https ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {results.security.mixed_content && (
                      <div className="text-amber-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Mixed content detected
                      </div>
                    )}
                  </div>
                </CheckCard>

                {/* Mobile Friendly */}
                <CheckCard
                  title="Mobile Friendly"
                  icon={<Smartphone className="w-5 h-5" />}
                  status={results.mobile_friendly.status}
                >
                  <div className="mt-4 space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-400">Viewport meta: </span>
                      <span className={results.mobile_friendly.viewport_meta ? 'text-emerald-400' : 'text-red-400'}>
                        {results.mobile_friendly.viewport_meta ? 'Present' : 'Missing'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Media queries: </span>
                      <span className={results.mobile_friendly.media_queries_detected ? 'text-emerald-400' : 'text-gray-500'}>
                        {results.mobile_friendly.media_queries_detected ? 'Detected' : 'Not detected'}
                      </span>
                    </div>
                  </div>
                </CheckCard>

                {/* Structured Data */}
                <CheckCard
                  title="Structured Data"
                  icon={<Code className="w-5 h-5" />}
                  status={results.structured_data.status}
                >
                  <div className="mt-4 space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-400">Present: </span>
                      <span className={results.structured_data.present ? 'text-emerald-400' : 'text-gray-500'}>
                        {results.structured_data.present ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {results.structured_data.types.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {results.structured_data.types.map((type, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>JSON-LD: {results.structured_data.json_ld_scripts.length}</span>
                      <span>Microdata: {results.structured_data.microdata_count}</span>
                      <span>RDFa: {results.structured_data.rdfa_count}</span>
                    </div>
                  </div>
                </CheckCard>

                {/* Page Load Time */}
                <CheckCard
                  title="Page Load Time"
                  icon={<Clock className="w-5 h-5" />}
                  status={results.page_load_time.status}
                >
                  <div className="mt-4 space-y-3">
                    <div className="text-2xl font-bold text-white">
                      {results.page_load_time.load_time_seconds.toFixed(3)}s
                    </div>
                    {results.page_load_time.metrics && (
                      <div className="text-sm text-gray-400">
                        HTML size: {results.page_load_time.metrics.html_size_kb} KB
                      </div>
                    )}
                  </div>
                </CheckCard>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

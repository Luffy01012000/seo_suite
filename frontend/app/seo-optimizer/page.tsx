"use client";

import React, { useState } from "react";
import {Navbar} from "@/components/Navbar";
import {Footer} from "@/components/Footer";
import { 
  BarChart, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Target,
  Image as ImageIcon,
  Link as LinkIcon,
  Type,
  Link as LinkIcon2,
  ListPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SEOMetrics {
  word_count: number;
  keyword_density: number;
  h1_count: number;
  h2_count: number;
  h3_count: number;
  internal_links: number;
  images: number;
  images_without_alt: number;
}

interface SEOAnalysisResponse {
  seo_score: number;
  metrics: SEOMetrics;
  recommendations: string[];
}

export default function SEOOptimizerPage() {
  const [article, setArticle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SEOAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingTitles, setExistingTitles] = useState("");
  const [linksLoading, setLinksLoading] = useState(false);
  const [linkSuggestions, setLinkSuggestions] = useState<any[] | null>(null);

  const handleAnalyze = async () => {
    if (!article || !keyword) {
      setError("Please provide both an article and a target keyword.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("http://localhost:8000/api/v1/seo/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article,
          keyword,
          title: title || undefined,
          meta_description: metaDescription || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze article. Please check your backend connection.");
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLinks = async () => {
    if (!article || !existingTitles.trim()) {
      setError("Please provide both the article and at least one existing blog title.");
      return;
    }

    setLinksLoading(true);
    setError(null);
    setLinkSuggestions(null);

    const titlesArray = existingTitles.split('\n').map(t => t.trim()).filter(t => t.length > 0);

    try {
      const response = await fetch("http://localhost:8000/api/v1/seo/internal-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article,
          existing_titles: titlesArray,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate internal links.");
      }

      const data = await response.json();
      setLinkSuggestions(data.suggestions);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLinksLoading(false);
    }
  };

  return (
    <main className="bg-black min-h-screen text-white selection:bg-red-500/30">
      <Navbar />

      <div className="pt-32 pb-20 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-600/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              SEO Blog <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Optimizer</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-xl">
              Turn your content into a search engine magnet. Get high-precision 
              SEO scores and actionable recommendations in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Input Column */}
            <div className="lg:col-span-full space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Target Keyword
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="e.g., Best AI SEO Tools"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-white placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                        SEO Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Page title for snippet analysis"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-white placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Meta Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Meta description for snippet analysis"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-white placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Article Content (HTML or Text)
                    </label>
                    <textarea
                      value={article}
                      onChange={(e) => setArticle(e.target.value)}
                      rows={12}
                      placeholder="Paste your blog post content here..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-white placeholder:text-gray-600 resize-none font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                       <ListPlus className="w-4 h-4 text-emerald-400" /> Existing Blog Titles
                    </label>
                    <textarea
                      value={existingTitles}
                      onChange={(e) => setExistingTitles(e.target.value)}
                      rows={4}
                      placeholder="Paste existing blog titles here (one per line) for Internal Link Suggestions..."
                      className="w-full bg-black/40 border border-emerald-500/20 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white placeholder:text-gray-600 resize-y text-sm"
                    />
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className={cn(
                      "w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl",
                      loading 
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                        : "bg-gradient-to-r from-red-600 to-orange-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-red-500/20"
                    )}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing Architecture...
                      </>
                    ) : (
                      <>
                        <BarChart className="w-6 h-6" />
                        Analyze & Optimize
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4 text-red-400">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Results Column */}
            {/* <div className="space-y-8"> */}
              {!results && !loading && (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white/5 border border-white/10 rounded-3xl border-dashed">
                  <FileText className="w-16 h-16 text-gray-700 mb-4" />
                  <h3 className="text-xl font-bold text-gray-500 mb-2">Ready for Analysis</h3>
                  <p className="text-gray-600 text-sm">Input your content and target keyword to see the magic happen.</p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center animate-pulse p-8 bg-white/5 border border-white/10 rounded-3xl">
                  <div className="w-24 h-24 rounded-full bg-white/10 mb-6" />
                  <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                </div>
              )}

              {results && (
                <>
                  {/* Score Card */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-red-500/20 transition-all duration-700" />
                    
                    <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-red-500" /> Overall Score
                    </h3>
                    
                    <div className="relative flex items-center justify-center mb-8">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-white/5"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={440}
                          strokeDashoffset={440 - (440 * results.seo_score) / 100}
                          className={cn(
                            "transition-all duration-1000 ease-out",
                            results.seo_score > 80 ? "text-emerald-500" : 
                            results.seo_score > 50 ? "text-orange-500" : "text-red-500"
                          )}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-white">{results.seo_score}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">SEO Purity</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <Type className="w-4 h-4 text-red-400" />
                          <span className="text-xs font-bold uppercase tracking-tighter">Words</span>
                        </div>
                        <span className="text-lg font-bold text-white">{results.metrics.word_count}</span>
                      </div>
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <Target className="w-4 h-4 text-orange-400" />
                          <span className="text-xs font-bold uppercase tracking-tighter">Density</span>
                        </div>
                        <span className="text-lg font-bold text-white">{results.metrics.keyword_density}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
                    <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                       Optimization Plan
                    </h3>
                    
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {results.recommendations.length > 0 ? (
                        results.recommendations.map((rec, i) => (
                          <div key={i} className="flex gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl group hover:bg-red-500/10 transition-colors">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-300 leading-relaxed font-medium">{rec}</p>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
                          <p className="text-emerald-400 font-bold">Perfect SEO! No recommendations.</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">H1</div>
                          <div className={cn("text-lg font-bold", results.metrics.h1_count === 1 ? "text-emerald-400" : "text-red-400")}>{results.metrics.h1_count}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">Links</div>
                          <div className={cn("text-lg font-bold", results.metrics.internal_links >= 2 ? "text-emerald-400" : "text-orange-400")}>{results.metrics.internal_links}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">Alt/Img</div>
                          <div className={cn("text-lg font-bold", results.metrics.images_without_alt === 0 ? "text-emerald-400" : "text-red-400")}>
                            {results.metrics.images - results.metrics.images_without_alt}/{results.metrics.images}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights Card */}
                  {results.ai_insights && (
                    <div className="bg-gradient-to-br from-red-600/10 to-orange-500/5 border border-red-500/20 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-red-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        🚀 AI Content Intelligence
                      </h3>
                      
                      <div className="prose prose-invert prose-sm max-w-none">
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                          {results.ai_insights.split('###').map((section, idx) => {
                            if (!section.trim()) return null;
                            const lines = section.trim().split('\n');
                            const title = lines[0];
                            const content = lines.slice(1).join('\n');
                            
                            return (
                              <div key={idx} className="mb-6 last:mb-0">
                                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                  {title}
                                </h4>
                                <div className="text-gray-400 text-sm">
                                  {content}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-red-500/10 flex items-center justify-between">
                        <span className="text-[10px] text-red-400/50 uppercase font-black tracking-[0.2em]">Generated by Gemini 1.5 Pro</span>
                        <Target className="w-4 h-4 text-red-500 opacity-20" />
                      </div>
                    </div>
                  )}

                  {/* AI Internal Link Suggestions */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-xl mt-8 relative overflow-hidden group">
                     <h3 className="text-lg font-bold text-emerald-400 uppercase tracking-widest mb-6 flex justify-between items-center gap-2">
                        <span><LinkIcon2 className="w-5 h-5 inline mr-2 text-emerald-500" /> AI Link Building</span>
                        <button 
                          onClick={handleGenerateLinks}
                          disabled={linksLoading || !existingTitles.trim()}
                          className={cn("text-xs px-4 py-2 rounded-xl transition-all font-bold", linksLoading || !existingTitles.trim() ? "bg-white/5 text-gray-500 cursor-not-allowed" : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30")}
                        >
                          {linksLoading ? "Generating..." : "Generate Links"}
                        </button>
                     </h3>
                     
                     {linkSuggestions ? (
                       <div className="space-y-4">
                         {linkSuggestions.length > 0 ? (
                           linkSuggestions.map((link, idx) => (
                             <div key={idx} className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                               <div className="flex justify-between items-start mb-2">
                                 <h4 className="text-white font-bold text-sm">Target: {link.target_title}</h4>
                                 <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-md font-mono">{link.suggested_anchor_text}</span>
                               </div>
                               <p className="text-gray-400 text-xs leading-relaxed">{link.reasoning}</p>
                             </div>
                           ))
                         ) : (
                           <div className="text-center py-6 text-gray-500 text-sm">No relevant semantic links found between this article and your existing titles.</div>
                         )}
                       </div>
                     ) : (
                       <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl">
                          <p className="text-gray-500 text-sm">Input your existing blog titles and click generate to find thematic internal linking opportunities.</p>
                       </div>
                     )}
                  </div>

                </>
              )}

            {/* </div> */}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.2);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.4);
        }
      `}</style>
    </main>
  );
}

"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Link as LinkIcon, 
  ListPlus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  FileText,
  ArrowRight,
  Anchor,
  Search,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestedLink {
  target_title: string;
  suggested_anchor_text: string;
  reasoning: string;
}

export default function InternalLinkingPage() {
  const [article, setArticle] = useState("");
  const [existingTitles, setExistingTitles] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedLink[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLinks = async () => {
    if (!article.trim() || !existingTitles.trim()) {
      setError("Please provide both the article content and existing blog titles.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions(null);

    const titlesArray = existingTitles
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

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
        throw new Error("Failed to generate internal links. Please check your connection.");
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-black min-h-screen text-white selection:bg-emerald-500/30">
      <Navbar />

      <div className="pt-32 pb-20 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-600/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-6">
              <Zap className="w-4 h-4" /> AI-Powered Authority Scaling
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Internal Link <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Architect</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-xl italic">
              &quot;Bridge your content semantically and boost topical authority with surgical precision.&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Input Section */}
            <div className="space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                       <FileText className="w-4 h-4 text-emerald-400" /> Target Article
                    </label>
                    <textarea
                      value={article}
                      onChange={(e) => setArticle(e.target.value)}
                      rows={12}
                      placeholder="Paste the blog post you want to optimize for internal linking..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white placeholder:text-gray-600 resize-none font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                       <ListPlus className="w-4 h-4 text-emerald-400" /> Existing Content Library
                    </label>
                    <textarea
                      value={existingTitles}
                      onChange={(e) => setExistingTitles(e.target.value)}
                      rows={6}
                      placeholder="Paste your existing blog titles here (one per line)..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white placeholder:text-gray-600 resize-y text-sm"
                    />
                  </div>

                  <button
                    onClick={handleGenerateLinks}
                    disabled={loading}
                    className={cn(
                      "w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl",
                      loading 
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                        : "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-emerald-500/20"
                    )}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing Semantic Bridges...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        Identify Linking Opportunities
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

            {/* Results Section */}
            <div className="space-y-6">
              {!suggestions && !loading && (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white/5 border border-white/10 rounded-3xl border-dashed">
                  <Anchor className="w-16 h-16 text-gray-700 mb-4" />
                  <h3 className="text-xl font-bold text-gray-500 mb-2">Waiting for Input</h3>
                  <p className="text-gray-600 text-sm max-w-xs">
                    Input your content and library titles on the left to discover semantic connection points.
                  </p>
                </div>
              )}

              {loading && (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
                      <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
                      <div className="h-4 bg-white/10 rounded w-1/2 mb-4" />
                      <div className="h-20 bg-white/5 rounded w-full" />
                    </div>
                  ))}
                </div>
              )}

              {suggestions && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                    Semantic Recommendations
                  </h3>
                  
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, idx) => (
                      <div 
                        key={idx} 
                        className="group bg-white/5 border border-white/10 hover:border-emerald-500/30 rounded-3xl p-6 backdrop-blur-sm transition-all duration-300 shadow-xl"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500/70">Target Content</span>
                            <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {suggestion.target_title}
                            </h4>
                          </div>
                          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                            <Anchor className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-mono font-bold text-emerald-300">
                              {suggestion.suggested_anchor_text}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl relative">
                          <p className="text-sm text-gray-400 leading-relaxed italic">
                            &ldquo;{suggestion.reasoning}&rdquo;
                          </p>
                        </div>
                        
                        <button className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-tighter">
                          Copy Anchor Text <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                       <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                       <p className="text-gray-400">No strong semantic matches found. Try adding more context or different target titles.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

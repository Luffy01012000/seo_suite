"use client";

import { useState } from "react";
import { ArrowRight, Search, Zap, TrendingUp, AlertCircle, Sparkles, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function KeywordResearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSuggestions([]);
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/keywords/suggest/free?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error("Failed to fetch keyword suggestions.");
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setSearchedQuery(data.query);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 selection:bg-purple-500/30">
        {/* Header */}
        <div className="max-w-7xl mx-auto pt-10 pb-12 text-center relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wide mb-4">
              <Sparkles className="w-3 h-3" />
              <span>Free Open Data API</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-3">
            Free Keyword <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Research</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
            Discover high-intent keyword ideas directly from Google Autocomplete without any expensive API limits.
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-3xl mx-auto mb-16 relative z-10">
          <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group focus-within:border-purple-500/30 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity" />
            
            <form onSubmit={handleSearch} className="relative z-10 flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Layers className="w-3 h-3 text-purple-400" /> Topic or Seed Keyword
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. how to learn python"
                    className="pl-12 h-14 bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-purple-500/50 rounded-2xl text-lg font-medium shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button 
                  type="submit" 
                  disabled={loading || !query.trim()}
                  className="h-14 px-8 w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] font-bold text-lg"
                >
                  {loading ? "Discovering..." : (
                    <>Search <ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </Button>
              </div>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {loading && (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-6">
                    <Search className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">Mining Google Autocomplete...</h3>
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-purple-500 rounded-full animate-ping" />
                </div>
            </div>
        )}

        {suggestions.length > 0 && !loading && (
          <div className="max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8 px-2 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <Zap className="w-6 h-6 text-purple-500" />
                Suggestions for "{searchedQuery}"
              </h2>
              <div className="bg-purple-500/20 text-purple-300 px-4 py-1.5 rounded-full text-sm font-bold border border-purple-500/20">
                {suggestions.length} Found
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion, idx) => (
                <div 
                  key={idx} 
                  className="group flex flex-col justify-center p-5 bg-[#0a0a0c] border border-white/5 hover:border-purple-500/30 rounded-2xl transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-purple-500/20 transition-all opacity-0 group-hover:opacity-100" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors shadow-inner">
                        <Search className="w-4 h-4" />
                      </div>
                      <span className="text-base font-bold text-gray-300 group-hover:text-white transition-colors">
                        {suggestion}
                      </span>
                    </div>
                    <div className="flex gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-600 group-hover:text-pink-400 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!loading && suggestions.length === 0 && searchedQuery && !error && (
          <div className="max-w-3xl mx-auto text-center py-16 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No suggestions found</h3>
            <p className="text-gray-400">Google Autocomplete didn't return anything for "{searchedQuery}". Try a broader term.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

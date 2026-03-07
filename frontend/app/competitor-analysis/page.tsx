"use client";

import { useState } from "react";
import { ArrowRight, Search, Activity, FileText, Image as ImageIcon, Link2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api/keywords";

interface CompetitorMetrics {
  word_count: number;
  h1_count: number;
  h2_count: number;
  keyword_density: number;
  images_count: number;
  images_without_alt: number;
  internal_links: number;
  external_links: number;
}

interface CompetitorResponse {
  url: string;
  keyword: string;
  metrics: CompetitorMetrics;
  insights: string[];
}

export default function CompetitorAnalysisPage() {
  const [keyword, setKeyword] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompetitorResponse | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !url) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/competitor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, competitor_url: url }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze competitor. Please check the URL.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 font-sans pb-24 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto pt-20 pb-12 text-center relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
          Competitor Page Analyzer
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          Spy on your competitors. Extract their SEO metrics, keyword density, and heading structure to build better content.
        </p>
      </div>

      {/* Input Form */}
      <div className="max-w-4xl mx-auto mb-16 relative z-10">
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group focus-within:border-indigo-500/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity" />
          
          <form onSubmit={handleAnalyze} className="relative z-10 flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Target Keyword</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. best running shoes"
                  className="pl-10 h-14 bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-indigo-500/50 rounded-xl text-base font-medium"
                  required
                />
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Competitor URL</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input 
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://competitor.com/article"
                  className="pl-10 h-14 bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-indigo-500/50 rounded-xl text-base font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="h-14 px-8 w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] font-bold"
              >
                {loading ? "Analyzing..." : (
                  <>Analyze <ArrowRight className="ml-2 w-5 h-5" /></>
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
      {result && (
        <div className="max-w-6xl mx-auto space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <MetricCard icon={<FileText />} label="Word Count" value={result.metrics.word_count.toLocaleString()} />
            <MetricCard 
                icon={<Activity />} 
                label="Keyword Density" 
                value={`${result.metrics.keyword_density}%`} 
                highlight={result.metrics.keyword_density >= 1 && result.metrics.keyword_density <= 2.5} 
            />
            <MetricCard icon={<ImageIcon />} label="Total Images" value={result.metrics.images_count} />
            <MetricCard icon={<Link2 />} label="Internal Links" value={result.metrics.internal_links} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Detailed SEO Structure */}
            <Card className="lg:col-span-1 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                  Structure Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">H1 Tags</span>
                    <Badge variant={result.metrics.h1_count === 1 ? "default" : "outline"} className="bg-white/10 text-white border-none">
                        {result.metrics.h1_count}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">H2 Tags</span>
                    <span className="text-white font-medium">{result.metrics.h2_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Images w/o Alt</span>
                    <Badge variant={result.metrics.images_without_alt === 0 ? "default" : "outline"} className="bg-white/10 text-white border-none">
                        {result.metrics.images_without_alt}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">External Links</span>
                    <span className="text-white font-medium">{result.metrics.external_links}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights & Strategy */}
            <Card className="lg:col-span-2 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                  Strategic Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {result.insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <span className="text-purple-400 text-sm font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      )}
    </main>
  );
}

function MetricCard({ icon, label, value, highlight = false }: { icon: React.ReactNode, label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${highlight ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5 bg-[#0a0a0c]'} shadow-lg relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 p-6 bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl ${highlight ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-gray-400'}`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-extrabold text-white">
        {value}
      </div>
    </div>
  );
}

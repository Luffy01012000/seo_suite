"use client";

import { useState, useEffect } from "react";
import { 
  ArrowRight, Search, Activity, FileText, Image as ImageIcon, 
  Link2, AlertCircle, Globe, TrendingUp, Users, Target, 
  Zap, PieChart, BarChart3, Database, Monitor
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api/keywords";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';

// --- Interfaces ---

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

interface DomainOverview {
  domain: string;
  organic_keywords: number;
  organic_traffic: number;
  organic_cost: number;
  paid_keywords: number;
  rank: number;
  historical_data: any[];
}

interface RankedKeyword {
  keyword: string;
  rank: number;
  search_volume: number;
  cpc: number;
  traffic_est: number;
  url?: string;
}

interface DomainCompetitor {
  domain: string;
  shared_keywords: number;
  common_keywords_count: number;
  relevance: number;
  organic_traffic_est: number;
}

interface DomainIntelligenceResponse {
  target: string;
  overview: DomainOverview;
  top_keywords: RankedKeyword[];
  top_competitors: DomainCompetitor[];
  data_source: string;
}

type Mode = "DOMAIN" | "PAGE";

export default function CompetitorAnalysisPage() {
  const [mode, setMode] = useState<Mode>("DOMAIN");
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState(""); // For Page mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageResult, setPageResult] = useState<CompetitorResponse | null>(null);
  const [domainResult, setDomainResult] = useState<DomainIntelligenceResponse | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === "PAGE") {
        const response = await fetch(`${API_BASE_URL}/api/v1/competitor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword, competitor_url: query }),
        });
        if (!response.ok) throw new Error("Failed to analyze competitor page.");
        const data = await response.json();
        setPageResult(data);
      } else {
        const response = await fetch(`${API_BASE_URL}/api/v1/competitor/domain/${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Failed to analyze domain.");
        const data = await response.json();
        setDomainResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 font-sans pb-24 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto pt-20 pb-8 text-center relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
          Competitor <span className="text-indigo-400">Intelligence</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium mb-8">
          Spy on domain performance or analyze specific pages. Reveal traffic secrets and keyword gaps.
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-12">
            <div className="bg-[#0a0a0c] border border-white/5 p-1 rounded-xl flex gap-1">
                <button 
                    onClick={() => setMode("DOMAIN")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === "DOMAIN" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-500 hover:text-gray-300"}`}
                >
                    Domain Overview
                </button>
                <button 
                    onClick={() => setMode("PAGE")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === "PAGE" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-500 hover:text-gray-300"}`}
                >
                    Page Analyzer
                </button>
            </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="max-w-4xl mx-auto mb-16 relative z-10">
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group focus-within:border-indigo-500/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity" />
          
          <form onSubmit={handleAnalyze} className="relative z-10 flex flex-col md:flex-row gap-4">
            {mode === "PAGE" && (
                <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Target Keyword</label>
                    <div className="relative">
                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input 
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="e.g. running shoes"
                            className="pl-10 h-14 bg-black/50 border-white/10 text-white placeholder:text-gray-600 rounded-xl"
                            required
                        />
                    </div>
                </div>
            )}
            
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{mode === "DOMAIN" ? "Enter Domain" : "Competitor URL"}</label>
              <div className="relative">
                {mode === "DOMAIN" ? <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" /> : <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />}
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={mode === "DOMAIN" ? "e.g. apple.com" : "https://competitor.com/article"}
                  className="pl-10 h-14 bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-indigo-500/50 rounded-xl text-base font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="h-14 px-10 w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all font-bold"
              >
                {loading ? "Spying..." : (
                  <>Spy Now <Zap className="ml-2 w-5 h-5 fill-current" /></>
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

      {/* DOMAIN Mode Results */}
      {mode === "DOMAIN" && domainResult && (
        <div className="max-w-7xl mx-auto space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Status Bar */}
          <div className="flex justify-end">
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-mono text-xs px-3 py-1 flex items-center gap-2">
                <Database className="w-3 h-3" />
                {domainResult.data_source.toUpperCase()} DATA
            </Badge>
          </div>

          {/* Top Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#0a0a0c] border-white/5 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                            <Search className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">Organic Keywords</span>
                    </div>
                    <div className="text-4xl font-extrabold text-white mb-2">{domainResult.overview.organic_keywords.toLocaleString()}</div>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <TrendingUp className="w-3 h-3" />
                        +12% vs last month
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#0a0a0c] border-white/5 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">Est. Monthly Clicks</span>
                    </div>
                    <div className="text-4xl font-extrabold text-white mb-2">{domainResult.overview.organic_traffic.toLocaleString()}</div>
                    <div className="text-gray-400 text-xs font-medium">Value: ~${(domainResult.overview.organic_traffic * 0.85).toFixed(0)}</div>
                </CardContent>
            </Card>

            <Card className="bg-[#0a0a0c] border-white/5 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">Strength Score</span>
                    </div>
                    <div className="text-4xl font-extrabold text-white mb-2">{100 - domainResult.overview.rank}/100</div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full" style={{ width: `${100 - domainResult.overview.rank}%` }} />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#0a0a0c] border-white/5 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">Paid Keywords</span>
                    </div>
                    <div className="text-4xl font-extrabold text-white mb-2">{domainResult.overview.paid_keywords}</div>
                    <Badge className="bg-red-500/10 text-red-400 border-none text-[10px]">NO ADS DETECTED</Badge>
                </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Historical Chart */}
            <Card className="lg:col-span-2 bg-[#0a0a0c] border-white/5">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                        Traffic History (Organic)
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={domainResult.overview.historical_data}>
                            <defs>
                                <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis 
                                dataKey="month" 
                                stroke="#94a3b8" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(val) => `${val}`}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="organic" 
                                stroke="#6366f1" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorOrganic)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Competition Grid */}
            <Card className="bg-[#0a0a0c] border-white/5">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Users className="w-5 h-5 text-indigo-400" />
                        Top Organic Competitors
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="space-y-4">
                        {domainResult.top_competitors.map((comp, i) => (
                            <div key={i} className="group p-3 rounded-xl hover:bg-white/5 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-bold text-gray-200 group-hover:text-indigo-400 transition-colors">{comp.domain}</span>
                                    <span className="text-[10px] font-mono text-gray-500 uppercase">{comp.shared_keywords} shared</span>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                                        style={{ width: `${comp.relevance * 100}%` }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-6 text-xs text-gray-500 hover:text-indigo-400 hover:bg-transparent">
                        VIEW ALL COMPETITORS <ArrowRight className="ml-2 w-3 h-3" />
                    </Button>
                </CardContent>
            </Card>
          </div>

          {/* Top Keywords Table */}
          <Card className="bg-[#0a0a0c] border-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <PieChart className="w-5 h-5 text-indigo-400" />
                    Dominant Organic Keywords
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                                <th className="px-6 py-4">Keyword</th>
                                <th className="px-6 py-4">Current Rank</th>
                                <th className="px-6 py-4">Monthly Vol</th>
                                <th className="px-6 py-4">Est. Clicks</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {domainResult.top_keywords.map((kw, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-200 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{kw.keyword}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className={`${kw.rank <= 10 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'} border-none`}>
                                            #{kw.rank}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-400">{kw.search_volume.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-white">{kw.traffic_est}</td>
                                    <td className="px-6 py-4">
                                        <Button variant="ghost" className="h-8 px-3 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/10">DETAILS</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PAGE Mode Results (Original) */}
      {mode === "PAGE" && pageResult && (
        <div className="max-w-6xl mx-auto space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <MetricCard icon={<FileText />} label="Word Count" value={pageResult.metrics.word_count.toLocaleString()} />
            <MetricCard 
                icon={<Activity />} 
                label="Keyword Density" 
                value={`${pageResult.metrics.keyword_density}%`} 
                highlight={pageResult.metrics.keyword_density >= 1 && pageResult.metrics.keyword_density <= 2.5} 
            />
            <MetricCard icon={<ImageIcon />} label="Total Images" value={pageResult.metrics.images_count} />
            <MetricCard icon={<Link2 />} label="Internal Links" value={pageResult.metrics.internal_links} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                  Structure Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">H1 Tags</span>
                    <Badge className="bg-white/10 text-white border-none">{pageResult.metrics.h1_count}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">H2 Tags</span>
                    <span className="text-white font-medium">{pageResult.metrics.h2_count}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Images w/o Alt</span>
                    <Badge variant={pageResult.metrics.images_without_alt === 0 ? "default" : "outline"} className="bg-white/10 text-white border-none">
                        {pageResult.metrics.images_without_alt}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                  Strategic Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {pageResult.insights.map((insight, idx) => (
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
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</span>
      </div>
      <div className="text-3xl font-extrabold text-white">
        {value}
      </div>
    </div>
  );
}

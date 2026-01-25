'use client';

import { useState } from 'react';
import { keywordAPI, KeywordAnalysisResponse, KeywordMetrics, KeywordCluster } from '@/lib/api/keywords';
import { Search, TrendingUp, Target, Lightbulb, Loader2, BarChart4, PieChart, Layers, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export default function KeywordResearchPage() {
    const [seedKeyword, setSeedKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<KeywordAnalysisResponse | null>(null);

    const handleAnalyze = async () => {
        if (!seedKeyword.trim()) {
            setError('Please enter a keyword');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await keywordAPI.analyzeKeywords(seedKeyword, {
                includeSuggestions: true,
                includeVolume: true,
                includeSerp: true,
                includeClustering: true,
                limit: 20,
            });
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze keywords');
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'very_easy':
                return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'easy':
                return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'medium':
                return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'hard':
                return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'very_hard':
                return 'text-red-400 bg-red-500/10 border-red-500/20';
            default:
                return 'text-gray-400 bg-white/5 border-white/10';
        }
    };

    const getIntentColor = (intent?: string) => {
        switch (intent) {
            case 'informational':
                return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'commercial':
                return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'transactional':
                return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'navigational':
                return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
            default:
                return 'text-gray-400 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="bg-black min-h-screen text-white flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header/Hero */}
                    <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wide mb-4">
                            <Sparkles className="w-3 h-3" />
                            <span>AI-Powered Intelligence</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-blue-200 text-transparent bg-clip-text drop-shadow-sm">
                            Smart Keyword Research
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
                            Uncover high-potential search opportunities with AI-driven analysis and competitive insights.
                        </p>
                    </div>

                    {/* Search Input Section */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 backdrop-blur-md shadow-2xl transition-all hover:border-white/20">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="text"
                                    value={seedKeyword}
                                    onChange={(e) => setSeedKeyword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                                    placeholder="Enter a seed keyword (e.g., 'seo tools')"
                                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-gray-600 outline-none text-lg"
                                />
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Target className="w-5 h-5" />
                                        Analyze
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-start gap-4 text-red-400 animate-in slide-in-from-top-2">
                                <Target className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Results */}
                    {results && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Keywords', value: results.total_keywords, icon: <Layers className="text-blue-400" /> },
                                    { label: 'Clusters', value: results.clusters?.length || 0, icon: <PieChart className="text-purple-400" /> },
                                    { label: 'Data Sources', value: results.data_sources.length, icon: <BarChart4 className="text-emerald-400" /> },
                                    { label: 'Status', value: results.cached ? '⚡ Cached' : '🔄 Fresh', icon: <Sparkles className="text-yellow-400" /> },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                                {stat.icon}
                                            </div>
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                                        </div>
                                        <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Keyword Clusters */}
                            {results.clusters && results.clusters.length > 0 && (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                                        <span className="bg-yellow-500/20 p-2 rounded-xl text-yellow-400">
                                            <Lightbulb className="w-5 h-5" />
                                        </span>
                                        AI-Grouped Clusters
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {results.clusters.map((cluster) => (
                                            <div key={cluster.cluster_id} className="group relative bg-black/40 p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                                                <div className="flex items-start justify-between mb-4">
                                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{cluster.cluster_name}</h3>
                                                    {cluster.intent && (
                                                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", getIntentColor(cluster.intent))}>
                                                            {cluster.intent}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mb-4">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Primary Intent Keyword</div>
                                                    <div className="text-blue-400 font-semibold flex items-center gap-2">
                                                        {cluster.primary_keyword}
                                                        <ArrowRight className="w-3 h-3 opacity-50" />
                                                    </div>
                                                </div>
                                                {cluster.avg_search_volume && (
                                                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                                                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                                                        <span>~{cluster.avg_search_volume.toLocaleString()} searches/mo</span>
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <div className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Included ({cluster.keywords.length})</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {cluster.keywords.slice(0, 5).map((kw, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-gray-300 border border-white/5">
                                                                {kw}
                                                            </span>
                                                        ))}
                                                        {cluster.keywords.length > 5 && (
                                                            <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-gray-500">
                                                                +{cluster.keywords.length - 5}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {cluster.recommendation && (
                                                    <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl relative overflow-hidden group/strat">
                                                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/strat:opacity-20 transition-opacity">
                                                            <Target className="w-8 h-8" />
                                                        </div>
                                                        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">AI Content Strategy</div>
                                                        <div className="text-xs text-gray-300 leading-relaxed italic">"{cluster.recommendation}"</div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Keywords Table */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md overflow-hidden">
                                <h2 className="text-2xl font-bold mb-8 text-white">Advanced Metrics</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left border-b border-white/10 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                                <th className="py-4 px-4 font-bold">Keyword</th>
                                                <th className="py-4 px-4 font-bold">Vol</th>
                                                <th className="py-4 px-4 font-bold">Comp</th>
                                                <th className="py-4 px-4 font-bold">CPC</th>
                                                <th className="py-4 px-4 font-bold text-center">Intent</th>
                                                <th className="py-4 px-4 font-bold text-right">Difficulty</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {results.keywords.map((keyword, idx) => (
                                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                    <td className="py-4 px-4 font-medium text-white group-hover:text-blue-400 transition-colors">
                                                        {keyword.keyword}
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-400">
                                                        {keyword.search_volume ? keyword.search_volume.toLocaleString() : '—'}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter",
                                                            keyword.competition === 'high' ? 'text-red-400 bg-red-400/10' :
                                                                keyword.competition === 'medium' ? 'text-yellow-400 bg-yellow-400/10' :
                                                                    'text-emerald-400 bg-emerald-400/10'
                                                        )}>
                                                            {keyword.competition || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-emerald-400 font-mono">
                                                        {keyword.cpc ? `$${keyword.cpc.toFixed(2)}` : '—'}
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        {keyword.intent && (
                                                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border", getIntentColor(keyword.intent))}>
                                                                {keyword.intent}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        {keyword.difficulty && (
                                                            <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border inline-block min-w-[80px] text-center", getDifficultyColor(keyword.difficulty))}>
                                                                {keyword.difficulty.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* AI Insights Card */}
                            {results.insights && (
                                <div className="p-[1px] rounded-3xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30">
                                    <div className="bg-black/80 rounded-[23px] p-8 backdrop-blur-xl">
                                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                            <Sparkles className="w-6 h-6 text-blue-400" />
                                            Deep Strategic Insights
                                        </h2>
                                        <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed text-sm">
                                            <pre className="bg-white/5 p-6 rounded-2xl overflow-auto border border-white/10 scrollbar-thin scrollbar-thumb-white/10">
                                                {JSON.stringify(results.insights, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

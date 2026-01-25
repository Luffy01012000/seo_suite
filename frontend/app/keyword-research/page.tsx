'use client';

import { useState } from 'react';
import { keywordAPI, KeywordAnalysisResponse, KeywordMetrics, KeywordCluster } from '@/lib/api/keywords';
import { Search, TrendingUp, Target, Lightbulb, Loader2 } from 'lucide-react';

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
                return 'text-green-600 bg-green-50';
            case 'easy':
                return 'text-green-500 bg-green-50';
            case 'medium':
                return 'text-yellow-600 bg-yellow-50';
            case 'hard':
                return 'text-orange-600 bg-orange-50';
            case 'very_hard':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getIntentColor = (intent?: string) => {
        switch (intent) {
            case 'informational':
                return 'text-blue-600 bg-blue-50';
            case 'commercial':
                return 'text-purple-600 bg-purple-50';
            case 'transactional':
                return 'text-green-600 bg-green-50';
            case 'navigational':
                return 'text-indigo-600 bg-indigo-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Smart Keyword Research
                    </h1>
                    <p className="text-gray-600 text-lg">
                        AI-powered keyword analysis with volume, competition, and strategic insights
                    </p>
                </div>

                {/* Search Input */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={seedKeyword}
                                onChange={(e) => setSeedKeyword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                                placeholder="Enter a seed keyword (e.g., 'seo tools')"
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                            />
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}
                </div>

                {/* Results */}
                {results && (
                    <div className="space-y-8">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="text-sm text-gray-600 mb-1">Total Keywords</div>
                                <div className="text-3xl font-bold text-blue-600">{results.total_keywords}</div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="text-sm text-gray-600 mb-1">Clusters</div>
                                <div className="text-3xl font-bold text-purple-600">{results.clusters?.length || 0}</div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="text-sm text-gray-600 mb-1">Data Sources</div>
                                <div className="text-3xl font-bold text-green-600">{results.data_sources.length}</div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="text-sm text-gray-600 mb-1">Status</div>
                                <div className="text-lg font-semibold text-gray-700">
                                    {results.cached ? '⚡ Cached' : '🔄 Fresh'}
                                </div>
                            </div>
                        </div>

                        {/* Keyword Clusters */}
                        {results.clusters && results.clusters.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-8">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                                    Keyword Clusters
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {results.clusters.map((cluster) => (
                                        <div key={cluster.cluster_id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="text-lg font-bold text-gray-800">{cluster.cluster_name}</h3>
                                                {cluster.intent && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getIntentColor(cluster.intent)}`}>
                                                        {cluster.intent}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mb-3">
                                                <span className="text-sm text-gray-600">Primary: </span>
                                                <span className="font-semibold text-blue-600">{cluster.primary_keyword}</span>
                                            </div>
                                            {cluster.avg_search_volume && (
                                                <div className="mb-3 flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                                    <span className="text-sm text-gray-600">Avg Volume: </span>
                                                    <span className="font-semibold">{cluster.avg_search_volume.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="mb-3">
                                                <div className="text-sm text-gray-600 mb-2">Keywords ({cluster.keywords.length}):</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {cluster.keywords.slice(0, 5).map((kw, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                                                            {kw}
                                                        </span>
                                                    ))}
                                                    {cluster.keywords.length > 5 && (
                                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                                                            +{cluster.keywords.length - 5} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {cluster.recommendation && (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                    <div className="text-xs text-blue-600 font-semibold mb-1">Strategy</div>
                                                    <div className="text-sm text-gray-700">{cluster.recommendation}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Keywords Table */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold mb-6">Keyword Analysis</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Keyword</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Volume</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Competition</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">CPC</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Intent</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Difficulty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.keywords.map((keyword, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium text-gray-800">{keyword.keyword}</td>
                                                <td className="py-3 px-4">
                                                    {keyword.search_volume ? keyword.search_volume.toLocaleString() : 'N/A'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${keyword.competition === 'low' ? 'bg-green-100 text-green-700' :
                                                            keyword.competition === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                keyword.competition === 'high' ? 'bg-red-100 text-red-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {keyword.competition || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {keyword.cpc ? `$${keyword.cpc.toFixed(2)}` : 'N/A'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {keyword.intent && (
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getIntentColor(keyword.intent)}`}>
                                                            {keyword.intent}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {keyword.difficulty && (
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(keyword.difficulty)}`}>
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

                        {/* AI Insights */}
                        {results.insights && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                                    AI-Powered Insights
                                </h2>
                                <div className="prose max-w-none">
                                    <pre className="bg-white p-6 rounded-xl overflow-auto text-sm">
                                        {JSON.stringify(results.insights, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

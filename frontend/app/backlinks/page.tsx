"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Globe,
  Database,
  ExternalLink,
  ShieldCheck,
  Activity,
  AlertCircle,
  Search,
  ListPlus,
  Zap,
  Anchor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { keywordAPI, BacklinkAnalysisResponse } from "@/lib/api/keywords";

export default function BacklinksPage() {
  const [target, setTarget] = useState("");
  const [backlinkMode, setBacklinkMode] = useState<"domain" | "subdomain" | "url">("domain");
  const [backlinkLoading, setBacklinkLoading] = useState(false);
  const [backlinkData, setBacklinkData] = useState<BacklinkAnalysisResponse | null>(null);
  const [backlinkError, setBacklinkError] = useState<string | null>(null);

  const handleAnalyzeBacklinks = async () => {
    if (!target.trim()) {
      setBacklinkError("Please provide a domain or URL to analyze.");
      return;
    }

    setBacklinkLoading(true);
    setBacklinkError(null);
    setBacklinkData(null);

    try {
      const data = await keywordAPI.analyzeBacklinks(target, backlinkMode, 50);
      setBacklinkData(data);
    } catch (err: unknown) {
      setBacklinkError(err instanceof Error ? err.message : "Failed to analyze backlinks.");
    } finally {
      setBacklinkLoading(false);
    }
  };

  return (
    <main className="bg-black min-h-screen text-white selection:bg-blue-500/30">
      <Navbar />

      <div className="pt-32 pb-20 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-6">
              <Globe className="w-4 h-4" /> Professional Backlink Intelligence
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Backlink <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Analytics</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-xl italic mb-10">
              &quot;Uncover the link profile of any domain and identify high-authority opportunities.&quot;
            </p>
          </div>

          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Backlink Analytics Search */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-sm shadow-2xl max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Enter domain or URL (e.g., google.com)"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
                  />
                </div>
                <select
                  value={backlinkMode}
                  onChange={(e) => setBacklinkMode(e.target.value as "domain" | "subdomain" | "url")}
                  className="bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="domain">Domain</option>
                  <option value="subdomain">Subdomain</option>
                  <option value="url">Exact URL</option>
                </select>
                <button
                  onClick={handleAnalyzeBacklinks}
                  disabled={backlinkLoading}
                  className={cn(
                    "px-10 py-4 rounded-2xl font-bold transition-all flex items-center gap-3",
                    backlinkLoading
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02]"
                  )}
                >
                  {backlinkLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  Analyze
                </button>
              </div>
              {backlinkError && (
                <p className="text-red-400 text-sm mt-4 ml-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {backlinkError}
                </p>
              )}
            </div>

            {backlinkData && (
              <div className="space-y-10">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:border-blue-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Auth Score</span>
                    </div>
                    <div className="text-5xl font-black text-white">{backlinkData.summary.rank}</div>
                    <p className="text-xs text-gray-500 mt-2 font-medium">Domain Authority Estimate</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                        <ExternalLink className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Backlinks</span>
                    </div>
                    <div className="text-5xl font-black text-white">{backlinkData.summary.total_backlinks.toLocaleString()}</div>
                    <p className="text-xs text-indigo-400 mt-2 font-bold uppercase tracking-tighter">
                      {backlinkData.summary.dofollow_percent}% Dofollow
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:border-purple-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
                        <Database className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Domains</span>
                    </div>
                    <div className="text-5xl font-black text-white">{backlinkData.summary.referring_domains.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-2 font-medium">Referring unique domains</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:border-orange-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400 group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ref. IPs</span>
                    </div>
                    <div className="text-5xl font-black text-white">{backlinkData.summary.referring_ips.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-2 font-medium">Unique IP addresses</p>
                  </div>
                </div>

                {/* Backlink List */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
                  <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <ListPlus className="w-6 h-6 text-blue-400" />
                      Live Backlink Profile
                    </h3>
                    <div className="px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
                      {backlinkData.data_source} Data
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/20">
                          <th className="px-8 py-6 text-gray-500 font-bold uppercase text-xs tracking-widest border-b border-white/5">Page AS</th>
                          <th className="px-8 py-6 text-gray-500 font-bold uppercase text-xs tracking-widest border-b border-white/5">Source Page title & URL</th>
                          <th className="px-8 py-6 text-gray-500 font-bold uppercase text-xs tracking-widest border-b border-white/5">Anchor text & Target URL</th>
                          <th className="px-8 py-6 text-gray-500 font-bold uppercase text-xs tracking-widest border-b border-white/5">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backlinkData.backlinks.map((link, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-6 border-b border-white/5">
                              <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center font-black text-blue-400 group-hover:border-blue-500/30 transition-all">
                                {link.rank || '-'}
                              </div>
                            </td>
                            <td className="px-8 py-6 border-b border-white/5 max-w-md">
                              <div className="font-bold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">{link.title || 'Untitled Page'}</div>
                              <div className="text-xs text-gray-500 hover:text-blue-400 transition-colors truncate">
                                <a href={link.url_from} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                  {link.url_from} <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </td>
                            <td className="px-8 py-6 border-b border-white/5 max-w-md">
                              <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl inline-flex items-center gap-2 mb-2">
                                <Anchor className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-xs font-mono font-bold text-blue-300">
                                  {link.anchor || 'Empty Anchor'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 hover:text-blue-400 transition-colors truncate">
                                <a href={link.url_to} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                  {link.url_to} <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </td>
                            <td className="px-8 py-6 border-b border-white/5">
                              {link.is_dofollow ? (
                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">Dofollow</span>
                              ) : (
                                <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">Nofollow</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {backlinkData.backlinks.length === 0 && (
                    <div className="p-20 text-center">
                      <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-gray-500">No backlinks discovered yet</h4>
                      <p className="text-gray-600 max-w-sm mx-auto mt-2">Try analyzing a root domain or a more established property.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!backlinkData && !backlinkLoading && (
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-10">
                 <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
                    <ShieldCheck className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                    <h4 className="font-bold mb-2">Authority Tracking</h4>
                    <p className="text-xs text-gray-500">Monitor your domain authority scores and competitive landscape in real-time.</p>
                 </div>
                 <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
                    <ExternalLink className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
                    <h4 className="font-bold mb-2">Link Intelligence</h4>
                    <p className="text-xs text-gray-500">Identify high-value links and discover where your competitors are getting their juice.</p>
                 </div>
                 <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
                    <Database className="w-10 h-10 text-purple-500 mx-auto mb-4" />
                    <h4 className="font-bold mb-2">Infinite Scaling</h4>
                    <p className="text-xs text-gray-500">Access data from millions of domains to power your outreach and link building efforts.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

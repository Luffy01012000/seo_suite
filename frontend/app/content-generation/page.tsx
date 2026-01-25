'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Upload, Sparkles, AlertCircle, CheckCircle, Link as LinkIcon, Image as ImageIcon, Check, Copy, X, Globe, Package, ListChecks, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface GeneratedContent {
    product_description?: string;
    seo_title: string;
    meta_description: string;
    bullet_features?: string[];
    page_summary?: string;
    suggested_keywords?: string[];
    content_strategy?: any;
}

interface PlagiarismResult {
    is_unique: boolean;
    plagiarism_score: number;
    sources_found: number;
}

interface ApiResponse {
    generated_content: string | GeneratedContent;
    plagiarism: PlagiarismResult;
    scraped_data?: any;
}

type Mode = 'product' | 'website';

export default function ContentGenerationPage() {
    const [mode, setMode] = useState<Mode>('product');
    const [prompt, setPrompt] = useState('');
    const [targetUrl, setTargetUrl] = useState('');

    const [image, setImage] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GeneratedContent | null>(null);
    const [plagiarism, setPlagiarism] = useState<PlagiarismResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string | undefined, field: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);
        setPlagiarism(null);

        try {
            const formData = new FormData();
            let endpoint = '';

            if (mode === 'product') {
                endpoint = 'http://localhost:8000/generate-product-content';
                formData.append('prompt', prompt);
                if (image) formData.append('images', image);
                if (imageUrl.trim()) formData.append('image_urls', imageUrl.trim());

                if (!image && !imageUrl.trim()) {
                    throw new Error('Please provide at least one product image.');
                }
            } else {
                endpoint = 'http://localhost:8000/generate-website-content';
                formData.append('url', targetUrl);
                if (prompt) formData.append('prompt', prompt);

                if (!targetUrl) {
                    throw new Error('Please enter a website URL.');
                }
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to generate content. Please try again.');
            }

            const data = await response.json();

            let parsedContent: GeneratedContent = {} as GeneratedContent;
            if (typeof data.generated_content === 'string') {
                try {
                    const cleanJson = data.generated_content.replace(/```json\n|\n```/g, '');
                    parsedContent = JSON.parse(cleanJson);
                } catch (e) {
                    console.error("Failed to parse JSON content", e);
                    parsedContent = {
                        seo_title: "Generated Title",
                        meta_description: "Generated Meta Description",
                        product_description: mode === 'product' ? data.generated_content : undefined,
                        page_summary: mode === 'website' ? data.generated_content : undefined,
                    } as GeneratedContent;
                }
            } else {
                parsedContent = data.generated_content;
            }

            setResult(parsedContent);
            setPlagiarism(data.plagiarism);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-black min-h-screen text-white flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wide mb-4">
                            <Sparkles className="w-3 h-3" />
                            <span>AI-Powered V2.1</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-blue-200 text-transparent bg-clip-text drop-shadow-sm">
                            AI SEO Content Engine
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
                            Generate high-conversion SEO content for products or whole websites in seconds.
                        </p>
                    </div>

                    {/* Mode Selection */}
                    <div className="flex justify-center mb-10">
                        <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex gap-1">
                            <button
                                onClick={() => setMode('product')}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium text-sm",
                                    mode === 'product' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-400 hover:text-white"
                                )}
                            >
                                <Package className="w-4 h-4" />
                                Product Optimization
                            </button>
                            <button
                                onClick={() => setMode('website')}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium text-sm",
                                    mode === 'website' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-400 hover:text-white"
                                )}
                            >
                                <Globe className="w-4 h-4" />
                                Website Audit & SEO
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Input Section */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 transition-colors hover:border-white/20 backdrop-blur-md shadow-2xl">
                            <h2 className="text-xl font-semibold mb-8 flex items-center gap-3 text-white">
                                <span className="bg-blue-500/20 p-2 rounded-xl text-blue-400">
                                    {mode === 'product' ? <Package className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                                </span>
                                {mode === 'product' ? 'Product Details' : 'Website Details'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {mode === 'website' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Website URL
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Globe className="h-4 w-4 text-gray-500" />
                                            </div>
                                            <input
                                                type="url"
                                                required
                                                value={targetUrl}
                                                onChange={(e) => setTargetUrl(e.target.value)}
                                                className="pl-11 w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-gray-600"
                                                placeholder="https://yourwebsite.com"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {mode === 'product' ? 'Product Description' : 'Additional Instructions (Optional)'}
                                    </label>
                                    <textarea
                                        required={mode === 'product'}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-gray-600 resize-none"
                                        placeholder={mode === 'product'
                                            ? "Describe your product (e.g., 'Eco-friendly bamboo toothbrush with soft bristles...')"
                                            : "e.g., 'Target tech-savvy audience', 'Focus on seasonal discounts'..."}
                                    />
                                </div>

                                {mode === 'product' && (
                                    <div className="space-y-4">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Product Images
                                        </label>

                                        {(imageFile || imageUrl) ? (
                                            <div className="relative w-full h-40 bg-black/20 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center group shadow-inner">
                                                <img
                                                    src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => { setImage(null); setImageFile(null); setImageUrl(''); }}
                                                    className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white/70 hover:text-white hover:bg-black/80 transition-all backdrop-blur-sm"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all bg-black/20 group">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <div className="p-3 bg-white/5 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                                        <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                                                    </div>
                                                    <p className="text-xs text-gray-500">Click to upload product image</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            setImage(e.target.files[0]);
                                                            setImageFile(e.target.files[0]);
                                                            setImageUrl('');
                                                        }
                                                    }}
                                                />
                                            </label>
                                        )}

                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <LinkIcon className="h-4 w-4 text-gray-500" />
                                            </div>
                                            <input
                                                type="text"
                                                value={imageUrl}
                                                onChange={(e) => {
                                                    setImageUrl(e.target.value);
                                                    if (e.target.value) { setImage(null); setImageFile(null); }
                                                }}
                                                className="pl-11 w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 text-sm"
                                                placeholder="Or paste image URL..."
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 hover:cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Analyzing {mode}...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Generate SEO Content
                                        </>
                                    )}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-start gap-4 text-red-400 animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm leading-relaxed">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Output Section */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 min-h-[600px] flex flex-col transition-all backdrop-blur-md">
                            <h2 className="text-xl font-semibold mb-8 flex items-center gap-3 text-white">
                                <span className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400"><Check className="w-5 h-5" /></span>
                                Generated Insights
                            </h2>

                            {result ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                                    {/* SEO Title */}
                                    <div className="group relative bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">SEO Optimized Title</label>
                                            <button
                                                onClick={() => handleCopy(result.seo_title, 'title')}
                                                className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-white transition-colors"
                                            >
                                                {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                        <p className="text-lg font-semibold text-white leading-snug">{result.seo_title}</p>
                                    </div>

                                    {/* Meta Description */}
                                    <div className="group relative bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Meta Description</label>
                                            <button
                                                onClick={() => handleCopy(result.meta_description, 'meta')}
                                                className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-white transition-colors"
                                            >
                                                {copiedField === 'meta' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{result.meta_description}</p>
                                    </div>

                                    {/* Main Content (Description or Summary) */}
                                    {(result.product_description || result.page_summary) && (
                                        <div className="group relative bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                                    {mode === 'product' ? 'Product Story' : 'Audit Summary'}
                                                </label>
                                                <button
                                                    onClick={() => handleCopy(result.product_description || result.page_summary, 'main')}
                                                    className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-white transition-colors"
                                                >
                                                    {copiedField === 'main' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <p className="text-gray-300 text-sm leading-relaxed">{result.product_description || result.page_summary}</p>
                                        </div>
                                    )}

                                    {/* Dynamic Mode-Specific Sections */}
                                    {mode === 'product' && result.bullet_features && (
                                        <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 block">Key Value Proportions</label>
                                            <ul className="space-y-3">
                                                {result.bullet_features.map((feature, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-gray-300">
                                                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {mode === 'website' && result.suggested_keywords && (
                                        <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 block">Suggested Keywords</label>
                                            <div className="flex flex-wrap gap-2">
                                                {result.suggested_keywords.map((kw, i) => (
                                                    <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-300">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {mode === 'website' && result.content_strategy && (
                                        <div className="bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/20">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Lightbulb className="w-5 h-5 text-indigo-400" />
                                                <h3 className="text-sm font-bold text-white tracking-wide">SEO Content Strategy</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {typeof result.content_strategy === 'string' ? (
                                                    <p className="text-xs text-gray-400 leading-relaxed">{result.content_strategy}</p>
                                                ) : (
                                                    Object.entries(result.content_strategy).map(([key, value]: [string, any], i) => (
                                                        <div key={i} className="space-y-1">
                                                            <h4 className="text-[10px] font-bold text-indigo-300 uppercase">{key.replace(/_/g, ' ')}</h4>
                                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                            </p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Integrity Check */}
                                    {plagiarism && (
                                        <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20 mt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Uniqueness Verified</span>
                                                </div>
                                                <span className="px-2 py-0.5 bg-emerald-500/20 rounded text-[10px] font-bold text-emerald-400">
                                                    {plagiarism.plagiarism_score}% ORIGINAL
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${100 - plagiarism.plagiarism_score}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center text-gray-600 opacity-40 py-20">
                                    <Sparkles className="w-20 h-20 mb-6 stroke-[1]" />
                                    <p className="text-sm font-medium">Your SEO audit results will manifest here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

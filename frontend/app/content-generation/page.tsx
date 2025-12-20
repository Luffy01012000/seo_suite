'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Upload, Sparkles, AlertCircle, CheckCircle, Link as LinkIcon, Image as ImageIcon, Check, Copy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface GeneratedContent {
    product_description: string;
    seo_title: string;
    meta_description: string;
    bullet_features: string[];
}

interface PlagiarismResult {
    is_unique: boolean;
    plagiarism_score: number;
    sources_found: number;
}

interface ApiResponse {
    generated_content: string | GeneratedContent;
    plagiarism: PlagiarismResult;
    seo_title?: string;
    meta_description?: string;
    product_description?: string;
    bullet_features?: string[];
}

export default function ContentGenerationPage() {
    const [prompt, setPrompt] = useState('');

    const [image, setImage] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ApiResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [plagiarism, setPlagiarism] = useState<PlagiarismResult | null>(null);




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
            formData.append('prompt', prompt);

            if (image) {
                formData.append('images', image);
            }

            if (imageUrl.trim()) {
                formData.append('image_urls', imageUrl.trim());
            }

            const response = await fetch('http://localhost:8000/generate-content', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to generate content. Please try again.');
            }

            const data = await response.json();

            // Normalize data structure if needed
            let parsedContent: GeneratedContent = {} as GeneratedContent;

            if (typeof data.generated_content === 'string') {
                try {
                    const cleanJson = data.generated_content.replace(/```json\n|\n```/g, '');
                    parsedContent = JSON.parse(cleanJson);
                } catch (e) {
                    console.error("Failed to parse JSON content", e);
                    // Fallback if parsing fails
                    parsedContent = {
                        product_description: data.generated_content,
                        seo_title: "Generated Title",
                        meta_description: "Generated Meta Description",
                        bullet_features: []
                    };
                }
            } else {
                parsedContent = data.generated_content;
            }

            // Merge parsed content into result for easier access
            const finalResult = {
                ...data,
                ...parsedContent
            };

            setResult(finalResult);
            if (data.plagiarism) {
                setPlagiarism(data.plagiarism);
            }

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
                            <span>AI-Powered V2.0</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-blue-200 text-transparent bg-clip-text drop-shadow-sm">
                            AI Content Generator
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
                            Create SEO-optimized product descriptions and metadata in seconds.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Input Section */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-colors hover:border-white/20 backdrop-blur-sm">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                                <span className="bg-orange-500/20 p-1.5 rounded-lg text-orange-400"><Sparkles className="w-5 h-5" /></span>
                                Input Details
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Product/Topic Description
                                    </label>
                                    <textarea
                                        required
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-gray-600 resize-none"
                                        placeholder="Describe your product or topic (e.g., 'A high-performance ergonomic office chair with lumbar support...')"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Reference Images (Optional)
                                    </label>
                                    <div className="space-y-4">
                                        {/* Unified Image Input */}
                                        <div className="flex flex-col gap-4">
                                            {/* Preview Section if image allows preview */}
                                            {(imageFile || imageUrl) ? (
                                                <div className="relative w-full h-48 bg-black/20 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center group">
                                                    {/* Display Image Preview for both File and URL */}
                                                    <img
                                                        src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-contain opacity-80"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImage(null);
                                                            setImageFile(null);
                                                            setImageUrl('');
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white/70 hover:text-white hover:bg-black/80 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>

                                                    {/* File Info Overlay for uploaded files */}
                                                    {imageFile && (
                                                        <div className="absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded-full text-xs text-white/90 backdrop-blur-sm">
                                                            {imageFile.name}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null}

                                            {/* Input Controls - Stacked */}
                                            <div className="flex flex-col gap-4">
                                                {/* File Upload Trigger */}
                                                <label className={`
                                                    flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all
                                                    ${imageFile
                                                        ? 'border-green-500/50 bg-green-500/10'
                                                        : 'border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 bg-black/20'}
                                                `}>
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <div className={`p-2 rounded-full mb-3 transition-transform ${imageFile ? 'bg-green-500/20' : 'bg-white/5 group-hover:scale-110'}`}>
                                                            {imageFile ? <CheckCircle className="w-6 h-6 text-green-400" /> : <Upload className="w-6 h-6 text-gray-400" />}
                                                        </div>
                                                        <p className="text-sm text-gray-500 text-center px-2">
                                                            {imageFile ? 'Change File' : 'Drop file or click to upload'}
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                setImage(e.target.files[0]);
                                                                setImageFile(e.target.files[0]);
                                                                setImageUrl(''); // Clear URL
                                                            }
                                                        }}
                                                    />
                                                </label>

                                                {/* OR Divider */}
                                                <div className="relative flex items-center py-2">
                                                    <div className="flex-grow border-t border-white/10"></div>
                                                    <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase">OR</span>
                                                    <div className="flex-grow border-t border-white/10"></div>
                                                </div>

                                                {/* URL Input */}
                                                <div className="flex flex-col justify-center gap-2">
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <LinkIcon className="h-5 w-5 text-gray-500" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={imageUrl}
                                                            onChange={(e) => {
                                                                setImageUrl(e.target.value);
                                                                if (e.target.value) {
                                                                    setImage(null);
                                                                    setImageFile(null); // Clear File
                                                                }
                                                            }}
                                                            className={`
                                                                pl-10 w-full bg-black/40 border rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent placeholder:text-gray-600 transition-all
                                                                ${imageUrl ? 'border-blue-500/50' : 'border-white/10'}
                                                            `}
                                                            placeholder="Paste an image URL..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Generate Content
                                        </>
                                    )}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Output Section */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[600px] flex flex-col transition-colors backdrop-blur-sm">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                                <span className="bg-green-500/20 p-1.5 rounded-lg text-green-400"><Check className="w-5 h-5" /></span>
                                Generated Results
                            </h2>

                            {result ? (
                                <div className="space-y-6 animate-in fade-in duration-500">

                                    {/* SEO Title */}
                                    <div className="group relative bg-black/40 p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all shadow-sm">
                                        <label className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block">SEO Title</label>
                                        <p className="text-lg font-medium text-white">{result.seo_title}</p>
                                        <button
                                            onClick={() => handleCopy(result.seo_title, 'title')}
                                            className="absolute top-2 right-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            {copiedField === 'title' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Meta Description */}
                                    <div className="group relative bg-black/40 p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all shadow-sm">
                                        <label className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block">Meta Description</label>
                                        <p className="text-gray-300 leading-relaxed">{result.meta_description}</p>
                                        <button
                                            onClick={() => handleCopy(result.meta_description, 'meta')}
                                            className="absolute top-2 right-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            {copiedField === 'meta' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Product Description */}
                                    <div className="group relative bg-black/40 p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all shadow-sm">
                                        <label className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block">Description</label>
                                        <div className="prose prose-invert max-w-none text-gray-300">
                                            <p>{result.product_description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(result.product_description, 'desc')}
                                            className="absolute top-2 right-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            {copiedField === 'desc' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Features */}
                                    <div className="group relative bg-black/40 p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all shadow-sm">
                                        <label className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block">Key Features</label>
                                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                                            {Array.isArray(result.bullet_features) ? (
                                                result.bullet_features.map((feature, i) => (
                                                    <li key={i}>{feature}</li>
                                                ))
                                            ) : (
                                                <li>{String(result.bullet_features)}</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Plagiarism Check */}
                                    {plagiarism && (
                                        <div className="bg-gradient-to-r from-green-900/10 to-emerald-900/10 p-5 rounded-xl border border-green-500/20 mt-4 backdrop-blur-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-bold text-green-400 uppercase tracking-wider block">Uniqueness Check</label>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${plagiarism.is_unique ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {plagiarism.is_unique ? 'UNIQUE' : 'POTENTIAL DUPLICATE'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 font-mono mt-1">
                                                Score: {plagiarism.plagiarism_score}% | Sources: {plagiarism.sources_found || 0}
                                            </p>
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center text-gray-500 opacity-50">
                                    <Sparkles className="w-16 h-16 mb-4" />
                                    <p>Generated content will appear here</p>
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

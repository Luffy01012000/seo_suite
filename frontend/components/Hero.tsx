import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-16">
            {/* Background Gradients - Adjusted for Dark Mode */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] opacity-70" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[128px] opacity-70" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/5 to-transparent blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 transition-colors hover:bg-white/10 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-300">New: AI Content Generation 2.0</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 drop-shadow-2xl">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Transform</span> Your Digital <br />
                    Presence with <span className="bg-gradient-to-r from-orange-500 via-blue-500 to-blue-600 text-transparent bg-clip-text animate-gradient">AI-Powered SEO</span>
                </h1>

                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Elevate Rankings. Drive Traffic. Dominate Search. Harness the power of artificial intelligence to revolutionize your SEO strategy.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/content-generation"
                        className="group relative px-10 py-4 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Get Started Today <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>

                    <Link
                        href="#services"
                        className="px-10 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all shadow-lg backdrop-blur-sm hover:border-white/20"
                    >
                        Learn More
                    </Link>
                </div>

                {/* Stats / Social Proof (Optional Mockup) */}
                <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Content Generated', value: '1M+' },
                        { label: 'SEO Success Rate', value: '98%' },
                        { label: 'Active Users', value: '10k+' },
                        { label: 'Avg. Ranking Boost', value: '300%' },
                    ].map((stat, i) => (
                        <div key={i} className="hover:scale-105 transition-transform duration-300">
                            <div className="text-3xl font-bold text-white mb-1 drop-shadow-lg">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

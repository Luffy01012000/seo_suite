import { PenTool, Search, BarChart3, Target, Zap, Layers } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const features = [
    {
        title: "AI Content Generation",
        description: "Create SEO-optimized content in seconds using advanced AI models tailored for your niche.",
        icon: PenTool,
        href: "/content-generation",
        isComingSoon: false
    },
    {
        title: "Smart Keyword Research",
        description: "Discover high-potential keywords with our intelligent analysis and competition tracking tools.",
        icon: Search,
        isComingSoon: true
    },
    {
        title: "Precision Optimization",
        description: "Optimize your existing content with real-time suggestions and readability scoring.",
        icon: Target,
        isComingSoon: true
    },
    {
        title: "Performance Analytics",
        description: "Track your rankings and traffic with detailed, easy-to-understand visual reports.",
        icon: BarChart3,
        isComingSoon: true
    },
    {
        title: "Content Strategy",
        description: "Get AI-generated content calendars and topic clusters to dominate your niche.",
        icon: Layers,
        isComingSoon: true
    },
    {
        title: "Instant Implementation",
        description: "Directly publish optimized content to your CMS with a single click.",
        icon: Zap,
        isComingSoon: true
    }
];

export function Services() {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Powerful Features for
                        <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                            Modern SEO
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to rank higher and drive more traffic.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href?: string;
    isComingSoon?: boolean;
}

export function FeatureCard({ title, description, icon: Icon, href, isComingSoon }: FeatureCardProps) {
    const CardContent = () => (
        <div className={cn(
            "relative p-8 rounded-2xl border transition-all duration-300",
            isComingSoon
                ? "bg-gray-50 border-gray-100 cursor-not-allowed opacity-80"
                : "bg-white border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 group cursor-pointer"
        )}>
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors",
                isComingSoon
                    ? "bg-gray-100 text-gray-400"
                    : "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white"
            )}>
                <Icon className="h-6 w-6" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed mb-6">{description}</p>

            {isComingSoon ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                    Coming Soon
                </span>
            ) : (
                <span className="inline-flex items-center text-violet-600 font-semibold group-hover:translate-x-1 transition-transform">
                    Try Now &rarr;
                </span>
            )}
        </div>
    );

    if (href && !isComingSoon) {
        return (
            <Link href={href}>
                <CardContent />
            </Link>
        );
    }

    return <CardContent />;
}

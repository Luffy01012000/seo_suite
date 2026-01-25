import { Navbar } from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Footer } from "@/components/Footer";
import Link from 'next/link';
import { Search, PenTool, BarChart, Link as LinkIcon, Settings, ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  comingSoon?: boolean;
  href?: string;
}

const ServiceCard = ({ icon, title, description, comingSoon, href }: ServiceCardProps) => {
  const content = (
    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/20 relative h-full flex flex-col">
      <div className="text-4xl mb-4 text-blue-500">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-white flex-grow">{title}</h3>
      <p className="text-gray-400 mb-6 leading-relaxed">{description}</p>
      {comingSoon ? (
        <div className="mt-auto inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-500 text-sm font-medium cursor-not-allowed w-fit">
          <span>Coming Soon</span>
        </div>
      ) : (
        <Link href={href || '#'} className="mt-auto inline-flex items-center text-blue-400 font-semibold hover:text-blue-300 transition-colors group-hover:translate-x-1 duration-300 w-fit">
          Try Now <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      )}
    </div>
  );

  return content;
};

const services: ServiceCardProps[] = [
  {
    icon: <Search className="w-8 h-8 text-blue-400" />,
    title: "Smart Keyword Research",
    description: "Uncover high-potential keywords with our intelligent algorithms, identifying opportunities your competitors miss.",
    href: "/keyword-research"
  },
  {
    icon: <PenTool className="w-8 h-8 text-orange-400" />,
    title: "Automated Content Generation",
    description: "Generate high-quality, SEO-optimized articles, blog posts, and product descriptions at lightning speed.",
    href: "/content-generation"
  },
  {
    icon: <BarChart className="w-8 h-8 text-red-400" />,
    title: "Performance Analytics",
    description: "Track your SEO performance with real-time data and receive actionable insights to continuously improve.",
    comingSoon: true
  },
  {
    icon: <LinkIcon className="w-8 h-8 text-green-400" />,
    title: "Intelligent Link Building",
    description: "Identify and acquire high-authority backlinks with AI-driven outreach strategies.",
    comingSoon: true
  },
  {
    icon: <Settings className="w-8 h-8 text-purple-400" />,
    title: "Technical SEO Audit",
    description: "Automated audits to pinpoint and fix technical issues hindering your search engine rankings.",
    comingSoon: true
  },
  {
    icon: "🎯",
    title: "Competitor Analysis",
    description: "Gain a competitive edge by understanding your rivals' SEO strategies and identifying their weaknesses.",
    comingSoon: true
  }
];


export default function Home() {
  return (
    <main className="bg-black min-h-screen text-white transition-colors duration-300">
      <Navbar />

      <Hero />

      {/* Services Section */}
      <section id="services" className="py-24 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-900/10 to-black pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Our <span className="text-blue-500">Intelligent Services</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Everything you need to dominate the search results, powered by next-generation AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us / Features */}
      <section id="features" className="py-24 bg-white/5 border-y border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Why Choose <span className="text-orange-500">SEO-AI Strategy?</span>
              </h2>
              <ul className="space-y-6">
                {[
                  "10x Faster Content Production",
                  "Data-Backed Decision Making",
                  "Enterprise-Grade Security",
                  "24/7 AI Availability"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center ring-1 ring-orange-500/30">
                      <span className="text-orange-500 font-bold">{i + 1}</span>
                    </div>
                    <span className="text-lg text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-600/20 blur-3xl rounded-full opacity-50" />
              <div className="relative bg-black/40 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-xl">
                <div className="space-y-4">
                  <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
                  <div className="h-32 bg-white/5 rounded border border-white/10 mt-6 flex items-center justify-center">
                    <span className="text-sm text-gray-500">AI Analysis Visualization</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="py-24 relative overflow-hidden">
        {/* Glow effect for CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/10 blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="bg-gradient-to-r from-blue-900/20 to-orange-900/20 border border-white/10 p-12 rounded-3xl shadow-xl backdrop-blur-md">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Transform Your SEO?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
              Join thousands of marketers using AI to scale their organic traffic and dominate search results.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/content-generation" className="px-10 py-4 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-blue-500/20">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

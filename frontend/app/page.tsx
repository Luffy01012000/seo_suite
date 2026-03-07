import { Navbar } from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import {
  Search,
  PenTool,
  BarChart,
  Link as LinkIcon,
  Settings,
  ArrowRight,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  comingSoon?: boolean;
  href?: string;
  buttonText?: string;
  color?: string;
}

const ServiceCard = ({
  icon,
  title,
  description,
  comingSoon,
  href,
  buttonText = "Try Now",
  color = "blue",
}: ServiceCardProps) => {
  const colorMap: Record<string, string> = {
    blue: "text-blue-500 hover:border-blue-500/50 hover:shadow-blue-500/20 shadow-blue-500/10",
    orange: "text-orange-500 hover:border-orange-500/50 hover:shadow-orange-500/20 shadow-orange-500/10",
    red: "text-red-500 hover:border-red-500/50 hover:shadow-red-500/20 shadow-red-500/10",
    green: "text-green-500 hover:border-green-500/50 hover:shadow-green-500/20 shadow-green-500/10",
    purple: "text-purple-500 hover:border-purple-500/50 hover:shadow-purple-500/20 shadow-purple-500/10",
  };

  const btnColorMap: Record<string, string> = {
    blue: "from-blue-600 to-blue-400 group-hover:shadow-blue-500/40",
    orange: "from-orange-600 to-orange-400 group-hover:shadow-orange-500/40",
    red: "from-red-600 to-red-400 group-hover:shadow-red-500/40",
    green: "from-green-600 to-green-400 group-hover:shadow-green-500/40",
    purple: "from-purple-600 to-purple-400 group-hover:shadow-purple-500/40",
  };

  return (
    <div className={cn(
      "group bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-xl transition-all duration-500 relative h-full flex flex-col",
      colorMap[color]
    )}>
      <div className="text-4xl mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">{icon}</div>
      <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">
        {title}
      </h3>
      <p className="text-gray-400 mb-8 leading-relaxed text-sm flex-grow">
        {description}
      </p>
      
      {comingSoon ? (
        <div className="mt-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 text-xs font-bold uppercase tracking-wider cursor-not-allowed w-fit">
          <span>Arriving Soon</span>
        </div>
      ) : (
        <Link
          href={href || "#"}
          className={cn(
            "mt-auto inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r text-white font-bold rounded-xl transition-all duration-300 shadow-lg group-hover:-translate-y-1",
            btnColorMap[color]
          )}
        >
          {buttonText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
};

const services: ServiceCardProps[] = [
  {
    icon: <Search className="w-8 h-8 text-blue-400" />,
    title: "Master the Search",
    description:
      "Dominate your niche with AI-driven keyword intelligence. Unearth high-intent opportunities that drive massive organic traffic before the competition even wakes up.",
    href: "/keyword-research",
    buttonText: "Find Goldmine Keywords",
    color: "blue",
  },
  {
    icon: <PenTool className="w-8 h-8 text-orange-400" />,
    title: "Craft Epic Content",
    description:
      "Transform raw ideas into viral-worthy, SEO-optimized masterpieces. Our Next-Gen AI writes content that ranks #1 and captivates humans and algorithms alike.",
    href: "/content-generation",
    buttonText: "Generate Viral Content",
    color: "orange",
  },
  {
    icon: <BarChart className="w-8 h-8 text-red-400" />,
    title: "Predictable Growth",
    description:
      "Stop guessing and start scaling. Get deep performance analytics and automated predictions that show exactly where your next growth spurt is coming from.",
    comingSoon: true,
    color: "red",
  },
  {
    icon: <LinkIcon className="w-8 h-8 text-green-400" />,
    title: "Authority Scaling",
    description:
      "Automate your link-building hustle. Identify and secure high-authority backlinks with AI-driven outreach that gets replied to every single time.",
    comingSoon: true,
    color: "green",
  },
  {
    icon: <Code className="w-8 h-8 text-purple-400" />,
    title: "Perfect Your Site",
    description:
      "Audit your technical foundations with surgical precision. Fix hidden leaks in your search visibility and ensure every page is a high-speed SEO powerhouse.",
    href: "/technical-seo",
    buttonText: "Launch Tech Audit",
    color: "purple",
  },
  {
    icon: <div className="text-3xl">🎯</div>,
    title: "Crush Competitors",
    description:
      "Infiltrate your rivals' strategies. See their secret keywords, backlink profiles, and content gaps to outmaneuver them at every turn.",
    comingSoon: true,
    color: "orange",
  },
];

export default function Home() {
  return (
    <main className="bg-black min-h-screen text-white selection:bg-blue-500/30">
      <Navbar />

      <Hero />

      {/* Services Section */}
      <section
        id="services"
        className="py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 text-white tracking-tight">
              Dominate with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300">Intelligence</span>
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto text-xl leading-relaxed font-medium">
              We've replaced guesswork with AI precision. Deploy specialized tools 
              designed to scale your organic footprint at exponential speeds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>


      {/* Why Choose Us / Features */}
      <section
        id="features"
        className="py-24 bg-white/5 border-y border-white/5 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Why Choose{" "}
                <span className="text-orange-500">SEO-AI Strategy?</span>
              </h2>
              <ul className="space-y-6">
                {[
                  "10x Faster Content Production",
                  "Data-Backed Decision Making",
                  "Enterprise-Grade Security",
                  "24/7 AI Availability",
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
                    <span className="text-sm text-gray-500">
                      AI Analysis Visualization
                    </span>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Transform Your SEO?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
              Join thousands of marketers using AI to scale their organic
              traffic and dominate search results.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/content-generation"
                className="px-10 py-4 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-blue-500/20"
              >
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

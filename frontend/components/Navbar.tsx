'use client'
import Link from 'next/link';
import { CheckCircle, X, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

// Placeholder for navLinks array to make the code syntactically correct
// In a real application, this would likely be defined elsewhere or passed as props.
const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
];

import { usePathname } from 'next/navigation';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed z-50 transition-all duration-500 ease-in-out ${isHomePage && isScrolled && !isOpen
                    ? 'top-4 inset-x-0 mx-auto w-[95%] max-w-5xl rounded-full border border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl'
                    : 'top-0 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-orange-500 to-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight">SEO-AI Strategy</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <div className="flex items-baseline space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-gray-300 hover:text-white px-1 py-2 text-sm font-medium transition-colors hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <Link
                            href="#contact"
                            className="relative bg-gradient-to-r from-orange-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-orange-500/20 hover:shadow-blue-500/40"
                        >
                            Contact Us
                        </Link>
                    </div>

                    <div className="-mr-2 flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 overflow-hidden transition-all duration-300">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/content-generation"
                            className="w-full text-center block bg-gradient-to-r from-orange-500 to-blue-600 text-white px-4 py-2 rounded-lg text-base font-medium hover:opacity-90 transition-opacity mt-4 shadow-lg shadow-blue-500/20"
                            onClick={() => setIsOpen(false)}
                        >
                            Try Content Gen
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

import { Bot, Twitter, Linkedin, Github, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 text-gray-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="bg-gradient-to-r from-orange-500 to-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-white tracking-tight">SEO-AI Strategy</span>
                        </Link>
                        <p className="text-gray-500 mb-6 max-w-sm">
                            Revolutionizing search engine optimization with advanced artificial intelligence.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Case Studies</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-600">
                        &copy; 2025 SEO-AI Strategy. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-gray-600 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></Link>
                        <Link href="#" className="text-gray-600 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></Link>
                        <Link href="#" className="text-gray-600 hover:text-white transition-colors"><Github className="w-5 h-5" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

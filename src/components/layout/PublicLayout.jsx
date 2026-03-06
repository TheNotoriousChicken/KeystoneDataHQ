import { Outlet, Link, useLocation } from 'react-router-dom';
import { Database } from 'lucide-react';

export default function PublicLayout() {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="border-b border-brand-border bg-brand-bg/95 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-brand-surface rounded-lg border border-brand-border group-hover:border-brand-primary transition-colors">
                            <Database className="w-5 h-5 text-brand-primary" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Keystone Data HQ</span>
                    </Link>

                    <div className="flex items-center gap-8">
                        <Link to="/#features" className="text-sm font-medium text-brand-muted hover:text-white transition-colors">
                            Features
                        </Link>
                        <Link to="/pricing" className="text-sm font-medium text-brand-muted hover:text-white transition-colors">
                            Pricing
                        </Link>
                        <Link to="/login" className="text-sm font-medium text-brand-muted hover:text-white transition-colors">
                            Login
                        </Link>
                        <button className="bg-brand-primary hover:bg-brand-primary-hover text-white font-medium px-5 py-2.5 rounded-[8px] transition-colors text-sm shadow-lg shadow-brand-primary/20">
                            Book Strategy Call
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="border-t border-brand-border bg-brand-bg py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-brand-muted" />
                        <span className="text-brand-muted text-sm">© 2026 Keystone Data HQ. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="text-sm text-brand-muted hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="text-sm text-brand-muted hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/refund" className="text-sm text-brand-muted hover:text-white transition-colors">Refund Policy</Link>
                        <a href="mailto:support@keystonedatahq.com" className="text-sm text-brand-muted hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

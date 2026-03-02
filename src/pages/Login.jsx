import { Link, useNavigate } from 'react-router-dom';
import { Database, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex bg-brand-bg">
            {/* Left side: Branded graphic */}
            <div className="hidden lg:flex w-1/2 p-12 flex-col justify-between relative overflow-hidden bg-brand-surface/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15),transparent_60%)]" />
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.1),transparent_50%)]" />

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-brand-surface rounded-lg border border-brand-primary/50">
                            <Database className="w-6 h-6 text-brand-primary" />
                        </div>
                        <span className="font-bold tracking-tight text-2xl text-white">Keystone</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg mt-auto mb-20">
                    <h2 className="text-4xl font-bold mb-6 leading-tight">Your data, decyphered.</h2>
                    <p className="text-brand-muted text-lg mb-12">
                        Access your real-time analytics, automated pipelines, and human-verified strategy reports all in one secure portal.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="glass-panel p-6 border-brand-primary/20 bg-brand-bg/50">
                            <TrendingUp className="w-8 h-8 text-brand-secondary mb-4" />
                            <div className="text-2xl font-bold mb-1">+48%</div>
                            <div className="text-sm text-brand-muted">Average ROAS Lift</div>
                        </div>
                        <div className="glass-panel p-6 border-brand-primary/20 bg-brand-bg/50">
                            <BarChart3 className="w-8 h-8 text-brand-primary mb-4" />
                            <div className="text-2xl font-bold mb-1">10h+</div>
                            <div className="text-sm text-brand-muted">Saved weekly on reporting</div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex gap-4 text-sm text-brand-muted">
                    <span>© 2026 Keystone Data HQ</span>
                </div>
            </div>

            {/* Right side: Login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
                <div className="w-full max-w-md space-y-8 absolute lg:relative">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-12 flex justify-center">
                        <Link to="/" className="flex items-center gap-2">
                            <Database className="w-8 h-8 text-brand-primary" />
                            <span className="font-bold text-2xl tracking-tight text-white">Keystone</span>
                        </Link>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
                        <p className="mt-2 text-brand-muted">Enter your details to access your dashboard.</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1.5" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="name@company.com"
                                    className="w-full px-4 py-3 bg-brand-surface/50 border border-brand-border rounded-[8px] text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all placeholder:text-brand-border"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-sm font-medium text-brand-muted" htmlFor="password">Password</label>
                                    <a href="#" className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-brand-surface/50 border border-brand-border rounded-[8px] text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all placeholder:text-brand-border"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3 px-4 rounded-[8px] font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20"
                        >
                            Sign In
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-brand-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 bg-brand-bg text-brand-muted uppercase tracking-wider">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary text-white py-3 px-4 rounded-[8px] font-medium flex items-center justify-center gap-3 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Google
                        </button>
                    </form>

                    <p className="text-center text-sm text-brand-muted">
                        Don't have an account?{' '}
                        <a href="/pricing" className="font-semibold text-white hover:text-brand-primary transition-colors">
                            View Plans
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

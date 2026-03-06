import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Database, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // UI State
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMessage, setErrorMessage] = useState('');

    // If there's no token in the URL, they shouldn't be here
    useEffect(() => {
        if (!token) {
            setErrorMessage('Invalid or missing password reset token.');
            setStatus('error');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) return;
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            setStatus('error');
            return;
        }

        setErrorMessage('');
        setStatus('loading');

        try {
            const res = await fetch('http://localhost:4000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to reset password.');
            }

            setStatus('success');
        } catch (err) {
            setErrorMessage(err.message);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-brand-surface/30 border-r border-brand-border">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_70%)]" />
                <div className="relative z-10 text-center px-12 max-w-lg">
                    <div className="inline-flex items-center gap-3 mb-8">
                        <div className="p-3 bg-brand-surface rounded-xl border border-brand-border shadow-lg">
                            <Database className="w-8 h-8 text-brand-primary" />
                        </div>
                        <span className="text-3xl font-bold tracking-tight text-white">Keystone Data HQ</span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">
                        Secure your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">data.</span>
                    </h2>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md my-auto"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
                        <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                            <Database className="w-5 h-5 text-brand-primary" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Keystone Data HQ</span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
                        Create new password
                    </h1>
                    <p className="text-brand-muted mb-8 text-sm leading-relaxed">
                        Enter your new password below. It must be at least 8 characters long.
                    </p>

                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-panel p-6 text-center space-y-4"
                            >
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Password Updated</h3>
                                <p className="text-brand-muted text-sm border-b border-brand-border pb-6">
                                    Your password has been successfully reset. You can now use your new password to access your account.
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3.5 rounded-xl font-bold transition-all shadow-lg mt-4"
                                >
                                    Sign In Now
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                {/* Error Message */}
                                <AnimatePresence>
                                    {status === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                                                {errorMessage}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* New Password Field */}
                                <div>
                                    <label className="block text-sm font-medium text-brand-muted mb-1.5">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={!token}
                                            minLength={8}
                                            placeholder="••••••••"
                                            className="w-full bg-brand-surface/80 border border-brand-border rounded-xl px-4 py-3 pr-12 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading' || !token}
                                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Save Password
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                <div className="mt-8 text-center pt-4">
                                    <Link to="/login" className="text-sm text-brand-muted hover:text-white transition-colors">
                                        ← Back to sign in
                                    </Link>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

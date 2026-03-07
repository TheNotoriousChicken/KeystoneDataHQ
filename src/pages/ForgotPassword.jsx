import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Database, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setStatus('loading');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send reset email.');
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
                        Let's get you back <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">in action.</span>
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
                        Reset your password
                    </h1>
                    <p className="text-brand-muted mb-8 text-sm leading-relaxed">
                        Enter the email address associated with your account and we'll send you a link to reset your password.
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
                                <h3 className="text-xl font-bold text-white">Check your email</h3>
                                <p className="text-brand-muted text-sm">
                                    If an account exists for <span className="text-white font-medium">{email}</span>,
                                    we have sent a password reset link. Please check your spam folder if you don't see it.
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-brand-surface border border-brand-border hover:bg-brand-surface/80 text-white py-3 rounded-xl font-bold transition-all mt-4"
                                >
                                    Return to sign in
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

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-brand-muted mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john@acmecorp.com"
                                        className="w-full bg-brand-surface/80 border border-brand-border rounded-xl px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Send Reset Link
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

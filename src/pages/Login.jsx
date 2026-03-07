import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Database, ArrowRight, Eye, EyeOff, Mail, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
    const { login, verifyTwoFactor } = useAuth();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState(null);
    const [resendStatus, setResendStatus] = useState('idle'); // idle | sending | sent

    // 2FA State
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState('');
    const [tempToken, setTempToken] = useState('');
    const [authCode, setAuthCode] = useState('');

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            if (err.requiresTwoFactor) {
                setRequires2FA(true);
                setTwoFactorMethod(err.method);
                setTempToken(err.tempToken);
                setError('');
            } else if (err.emailNotVerified) {
                setUnverifiedEmail(err.email);
                setError('');
            } else {
                setError(err.message);
                setUnverifiedEmail(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await verifyTwoFactor(tempToken, authCode);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
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
                        Your data, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">finally unified.</span>
                    </h2>
                    <p className="text-brand-muted text-lg leading-relaxed">
                        The outsourced data department for e-commerce brands doing $1M–$50M in revenue. Stop guessing, start scaling.
                    </p>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
                        <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                            <Database className="w-5 h-5 text-brand-primary" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Keystone Data HQ</span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
                        Welcome back
                    </h1>
                    <p className="text-brand-muted mb-8">
                        Sign in to access your analytics dashboard.
                    </p>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Unverified Email Banner */}
                    <AnimatePresence>
                        {unverifiedEmail && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm"
                            >
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold mb-1">Email not verified</p>
                                        <p className="text-amber-400/80 text-xs mb-3">
                                            Please check your inbox for a verification link. Can't find it?
                                        </p>
                                        <button
                                            type="button"
                                            disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                                            onClick={async () => {
                                                setResendStatus('sending');
                                                try {
                                                    await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ email: unverifiedEmail }),
                                                    });
                                                    setResendStatus('sent');
                                                } catch { setResendStatus('idle'); }
                                            }}
                                            className="text-xs font-bold text-amber-300 hover:text-white transition-colors disabled:opacity-50"
                                        >
                                            {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? '✓ Verification email sent!' : 'Resend verification email'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!requires2FA ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="john@acmecorp.com"
                                    className="w-full bg-brand-surface/80 border border-brand-border rounded-xl px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-sm font-medium text-brand-muted">Password</label>
                                    <Link to="/forgot-password" className="text-xs font-semibold text-brand-primary hover:text-white transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        placeholder="••••••••"
                                        className="w-full bg-brand-surface/80 border border-brand-border rounded-xl px-4 py-3 pr-12 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
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

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify2FA} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-brand-surface/50 border border-brand-primary/20 p-5 rounded-xl mb-6">
                                <div className="flex items-start gap-3">
                                    <ShieldAlert className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-white mb-1">Two-Factor Authentication</h3>
                                        <p className="text-xs text-brand-muted leading-relaxed">
                                            {twoFactorMethod === 'APP'
                                                ? "Open your authenticator app (e.g. Google Authenticator) and enter the 6-digit code for Keystone Data HQ."
                                                : "We've sent a 6-digit verification code to your email address. It expires in 10 minutes."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1.5 text-center">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={authCode}
                                    onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, ''))} // numbers only
                                    placeholder="000000"
                                    className="w-full text-center tracking-[0.5em] text-2xl font-bold bg-brand-surface/80 border border-brand-border rounded-xl px-4 py-4 text-white placeholder-brand-muted/30 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || authCode.length !== 6}
                                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Verify & Login
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRequires2FA(false);
                                        setTempToken('');
                                        setAuthCode('');
                                        setError('');
                                    }}
                                    className="text-sm text-brand-muted hover:text-white transition-colors"
                                >
                                    Cancel and return to login
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Link to Register */}
                    <div className="mt-8 text-center">
                        <p className="text-brand-muted text-sm">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-brand-primary hover:text-white font-semibold transition-colors"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-6 text-center">
                        <Link to="/" className="text-sm text-brand-muted hover:text-white transition-colors">
                            ← Back to home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Database, ArrowRight, Eye, EyeOff, CheckCircle2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Check if user arrived via an invite link
    const inviteToken = searchParams.get('invite');

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidatingInvite, setIsValidatingInvite] = useState(!!inviteToken);
    const [inviteDetails, setInviteDetails] = useState(null);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [resendStatus, setResendStatus] = useState('idle');

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [companyName, setCompanyName] = useState('');

    // If there's an invite token, validate it immediately
    useEffect(() => {
        if (!inviteToken) return;

        const validateInvite = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/validate-invite/${inviteToken}`);
                const data = await res.json();

                if (!res.ok || !data.valid) {
                    throw new Error(data.error || 'This invite link is invalid or has expired.');
                }

                // Pre-fill data from the invite
                setInviteDetails(data);
                setEmail(data.email);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsValidatingInvite(false);
            }
        };

        validateInvite();
    }, [inviteToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // If they don't have an invite, companyName is required
            if (!inviteToken && !companyName) {
                setError('Company Name is required.');
                setIsLoading(false);
                return;
            }

            // Call register context function
            await register(email, password, firstName, lastName, companyName, inviteToken);

            // Show 'check your email' instead of navigating to dashboard
            setRegistrationComplete(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidatingInvite) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (registrationComplete) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md glass-panel p-8 text-center space-y-5"
                >
                    <div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="w-7 h-7 text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Check your email</h2>
                    <p className="text-brand-muted text-sm leading-relaxed">
                        We've sent a verification link to <strong className="text-white">{email}</strong>.
                        Click the link in the email to activate your account.
                    </p>
                    <div className="pt-2 border-t border-brand-border">
                        <p className="text-brand-muted text-xs mb-3">Didn't receive it?</p>
                        <button
                            disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                            onClick={async () => {
                                setResendStatus('sending');
                                try {
                                    await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ email }),
                                    });
                                    setResendStatus('sent');
                                } catch { setResendStatus('idle'); }
                            }}
                            className="text-sm font-bold text-brand-primary hover:text-white transition-colors disabled:opacity-50"
                        >
                            {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? '✓ Sent! Check your inbox.' : 'Resend verification email'}
                        </button>
                    </div>
                    <Link to="/login" className="block text-sm text-brand-muted hover:text-white transition-colors mt-4">
                        ← Back to sign in
                    </Link>
                </motion.div>
            </div>
        );
    }

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
                        {inviteDetails ? 'Join your team' : 'Create your account'}
                    </h1>

                    {inviteDetails ? (
                        <div className="mb-8 p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                            <p className="text-brand-muted text-sm leading-relaxed">
                                You have been invited to join <strong className="text-white">{inviteDetails.companyName}</strong>. Fill out the details below to complete your setup.
                            </p>
                        </div>
                    ) : (
                        <p className="text-brand-muted mb-8">
                            Start your free 14-day trial. No credit card required.
                        </p>
                    )}

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                                    {error}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1.5">First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="John"
                                    className="w-full bg-brand-surface/80 border border-brand-border rounded-xl px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1.5">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    className="w-full bg-brand-surface/80 border border-brand-border rounded-xl px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Only show Company Name if they are NOT joining via an invite */}
                        {!inviteDetails && (
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1.5">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Acme Corp"
                                    className="w-full bg-brand-surface/80 border border-brand-border rounded-xl px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-brand-muted mb-1.5">Email Address</label>
                            <input
                                type="email"
                                required
                                disabled={!!inviteDetails} // Lock email if they were invited
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@acmecorp.com"
                                className="w-full bg-brand-surface/80 border border-brand-border rounded-xl px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-muted mb-1.5">Password</label>
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {inviteDetails ? 'Complete Profile ->' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-brand-muted text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-brand-primary hover:text-white font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

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

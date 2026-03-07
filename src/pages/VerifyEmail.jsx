import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Database, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { saveSessionDirect } = useAuth();

    const [status, setStatus] = useState('verifying'); // verifying | success | error
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setErrorMessage('Missing verification token.');
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
<<<<<<< HEAD
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-email`, {
=======
                const res = await fetch('http://localhost:4000/api/auth/verify-email', {
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Verification failed.');
                }

                // Auto-login the user with the returned JWT
                if (data.token && data.user) {
                    saveSessionDirect(data.token, data.user);
                }

                setStatus('success');

                // Redirect to dashboard after a short delay
                setTimeout(() => navigate('/dashboard'), 3000);
            } catch (err) {
                setErrorMessage(err.message);
                setStatus('error');
            }
        };

        verify();
    }, [token]);

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
                        Almost <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">there.</span>
                    </h2>
                </div>
            </div>

            {/* Right Panel — Status */}
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

                    <div className="glass-panel p-8 text-center space-y-5">
                        {status === 'verifying' && (
                            <>
                                <div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto">
                                    <Loader2 className="w-7 h-7 text-brand-primary animate-spin" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Verifying your email...</h2>
                                <p className="text-brand-muted text-sm">
                                    Hang tight, this will only take a moment.
                                </p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
                                <p className="text-brand-muted text-sm">
                                    Your account is all set. Redirecting you to the dashboard...
                                </p>
                                <div className="w-full bg-brand-surface rounded-full h-1.5 mt-4 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 3, ease: 'linear' }}
                                        className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                                    />
                                </div>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <XCircle className="w-7 h-7 text-rose-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                                <p className="text-rose-400 text-sm">{errorMessage}</p>
                                <Link
                                    to="/login"
                                    className="inline-block mt-4 bg-brand-surface border border-brand-border hover:bg-brand-surface/80 text-white py-3 px-6 rounded-xl font-bold transition-all"
                                >
                                    Go to Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

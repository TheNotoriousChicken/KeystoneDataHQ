import { useState, useEffect } from 'react';
import { Shield, Smartphone, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TwoFactorSetup() {
    const { token } = useAuth();
    const [status, setStatus] = useState(null); // { isEligible, isEnabled, method }
    const [isLoading, setIsLoading] = useState(true);

    // Setup flow state
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(''); // 'APP' or 'EMAIL'
    const [setupData, setSetupData] = useState(null); // { qrCodeUrl, secret }
    const [verificationCode, setVerificationCode] = useState('');
    const [setupError, setSetupError] = useState('');
    const [disablePassword, setDisablePassword] = useState('');
    const [disableError, setDisableError] = useState('');

    const fetchStatus = async () => {
        try {
<<<<<<< HEAD
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/2fa/status`, {
=======
            const res = await fetch('http://localhost:4000/api/auth/2fa/status', {
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
            }
        } catch (err) {
            console.error('Failed to fetch 2FA status:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchStatus();
    }, [token]);

    const handleInitiateSetup = async (method) => {
        setSetupError('');
        setSelectedMethod(method);
        setIsSettingUp(true);

        try {
<<<<<<< HEAD
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/2fa/setup`, {
=======
            const res = await fetch('http://localhost:4000/api/auth/2fa/setup', {
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ method })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setSetupData(data); // Will contain qrCodeUrl for APP
        } catch (err) {
            setSetupError(err.message);
            setIsSettingUp(false);
        }
    };

    const handleVerifySetup = async (e) => {
        e.preventDefault();
        setSetupError('');

        try {
<<<<<<< HEAD
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/2fa/verify-setup`, {
=======
            const res = await fetch('http://localhost:4000/api/auth/2fa/verify-setup', {
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ method: selectedMethod, code: verificationCode })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Success
            await fetchStatus();
            setIsSettingUp(false);
            setSetupData(null);
            setVerificationCode('');
        } catch (err) {
            setSetupError(err.message);
        }
    };

    const handleDisable = async (e) => {
        e.preventDefault();
        setDisableError('');

        try {
<<<<<<< HEAD
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/2fa/disable`, {
=======
            const res = await fetch('http://localhost:4000/api/auth/2fa/disable', {
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: disablePassword })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            await fetchStatus();
            setDisablePassword('');
        } catch (err) {
            setDisableError(err.message);
        }
    };

    if (isLoading) return null;

    if (!status?.isEligible) {
        return (
            <div className="glass-panel overflow-hidden opacity-50">
                <div className="border-b border-white/5 p-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-brand-primary" /> Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-brand-muted text-sm mt-1">Upgrade to the Growth plan to unlock enhanced account security.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel overflow-hidden">
            <div className="border-b border-white/5 p-6 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-brand-primary" /> Two-Factor Authentication
                    </h3>
                    <p className="text-brand-muted text-sm mt-1">Add an extra layer of security to your account.</p>
                </div>
                {status.isEnabled && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                        <CheckCircle2 className="w-4 h-4" /> Enabled ({status.method})
                    </span>
                )}
            </div>

            <div className="p-6">
                {!status.isEnabled && !isSettingUp && (
                    <div className="space-y-4">
                        <p className="text-brand-muted text-sm mb-6">
                            Protect your account by requiring a verification code in addition to your password when you sign in. Choose a method below.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => handleInitiateSetup('APP')}
                                className="text-left p-5 rounded-xl border border-brand-border bg-brand-surface/30 hover:border-brand-primary hover:bg-brand-surface transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center mb-3 group-hover:bg-brand-primary/20 transition-colors">
                                    <Smartphone className="w-5 h-5 text-brand-primary" />
                                </div>
                                <h4 className="text-white font-medium mb-1">Authenticator App</h4>
                                <p className="text-xs text-brand-muted leading-relaxed">
                                    Use Google Authenticator, Authy, or 1Password to generate codes. Most secure.
                                </p>
                            </button>

                            <button
                                onClick={() => handleInitiateSetup('EMAIL')}
                                className="text-left p-5 rounded-xl border border-brand-border bg-brand-surface/30 hover:border-brand-primary hover:bg-brand-surface transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center mb-3 group-hover:bg-brand-primary/20 transition-colors">
                                    <Mail className="w-5 h-5 text-brand-primary" />
                                </div>
                                <h4 className="text-white font-medium mb-1">Email Verification</h4>
                                <p className="text-xs text-brand-muted leading-relaxed">
                                    Receive a temporary 6-digit code in your inbox every time you log in.
                                </p>
                            </button>
                        </div>
                    </div>
                )}

                {isSettingUp && (
                    <form onSubmit={handleVerifySetup} className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-medium">
                                Configure {selectedMethod === 'APP' ? 'Authenticator App' : 'Email'} 2FA
                            </h4>
                            <button
                                type="button"
                                onClick={() => { setIsSettingUp(false); setSetupData(null); }}
                                className="text-xs text-brand-muted hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {selectedMethod === 'APP' && setupData?.qrCodeUrl && (
                            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-brand-surface/30 p-6 rounded-xl border border-brand-border">
                                <div className="bg-white p-2 rounded-lg shrink-0">
                                    <img src={setupData.qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                                </div>
                                <div>
                                    <p className="text-sm text-brand-muted mb-3 leading-relaxed">
                                        Scan this QR code with your authenticator app (like Google Authenticator or Authy).
                                        If you can't scan it, enter this setup key manually:
                                    </p>
                                    <code className="bg-black/30 text-brand-primary font-mono text-xs py-1.5 px-3 rounded select-all block mb-4">
                                        {setupData.secret}
                                    </code>
                                    <p className="text-xs text-amber-500 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Write down this key. It is the only way to recover your account if you lose your phone.
                                    </p>
                                </div>
                            </div>
                        )}

                        {selectedMethod === 'EMAIL' && (
                            <div className="bg-brand-surface/30 p-5 rounded-xl border border-brand-border">
                                <p className="text-sm text-brand-muted flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    We've sent a 6-digit verification code to your email address.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-brand-muted mb-1.5">
                                Enter the 6-digit code to verify setup
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full sm:w-64 tracking-[0.5em] text-lg text-center bg-brand-surface/50 border border-brand-border rounded-lg px-4 py-3 text-white placeholder-brand-muted/30 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
                            />
                        </div>

                        {setupError && (
                            <p className="text-sm text-rose-400 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4" /> {setupError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={verificationCode.length !== 6}
                            className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Verify & Enable
                        </button>
                    </form>
                )}

                {status.isEnabled && (
                    <form onSubmit={handleDisable} className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6">
                        <h4 className="text-rose-400 font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Danger Zone: Disable 2FA
                        </h4>
                        <p className="text-sm text-brand-muted mb-4">
                            Disabling two-factor authentication will make your account significantly less secure.
                            Please enter your password to confirm this action.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="password"
                                required
                                value={disablePassword}
                                onChange={(e) => setDisablePassword(e.target.value)}
                                placeholder="Current Password"
                                className="flex-1 bg-brand-surface border border-rose-500/30 rounded-lg px-4 py-2 text-white placeholder-brand-muted/50 focus:outline-none focus:border-rose-400 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!disablePassword}
                                className="bg-rose-500/20 hover:bg-rose-500 text-white px-5 py-2 rounded-lg font-medium transition-colors border border-rose-500/50 disabled:opacity-50 whitespace-nowrap"
                            >
                                Disable 2FA
                            </button>
                        </div>
                        {disableError && (
                            <p className="text-sm text-rose-400 mt-3">{disableError}</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}

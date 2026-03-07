import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/Skeleton';
import TwoFactorSetup from '../components/auth/TwoFactorSetup';
import ImageUploader from '../components/settings/ImageUploader';

export default function Profile() {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [initialFetchError, setInitialFetchError] = useState('');

    // Profile State
    const [profile, setProfile] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' }); // type: success | error

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // Fetch Profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                setProfile(data);
                setFirstName(data.firstName);
                setLastName(data.lastName);
                setEmail(data.email);
            } catch (err) {
                setInitialFetchError('Failed to load profile. Please refresh.');
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchProfile();
    }, [token]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setProfileMessage({ type: '', text: '' });

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ firstName, lastName, email })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setProfile(data.user);
            setProfileMessage({
                type: 'success',
                text: data.message
            });

            // Clear message after 5 seconds
            setTimeout(() => setProfileMessage({ type: '', text: '' }), 5000);
        } catch (err) {
            setProfileMessage({ type: 'error', text: err.message });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setIsSavingPassword(true);
        setPasswordMessage({ type: '', text: '' });

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Reset form
            setCurrentPassword('');
            setNewPassword('');
            setPasswordMessage({ type: 'success', text: data.message });

            setTimeout(() => setPasswordMessage({ type: '', text: '' }), 5000);
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.message });
        } finally {
            setIsSavingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl space-y-6">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-[400px] w-full rounded-xl" />
                <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
        );
    }

    if (initialFetchError) {
        return (
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl max-w-2xl">
                <p className="text-rose-400 font-medium">{initialFetchError}</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Profile & Account</h2>
                <p className="text-brand-muted mt-1">Manage your personal information and security settings.</p>
            </div>

            {/* General Profile Section */}
            <div className="glass-panel overflow-hidden">
                <div className="border-b border-white/5 p-6 flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex flex-shrink-0 items-center justify-center text-brand-primary font-bold text-2xl border border-brand-primary/30 overflow-hidden">
                        {profile?.avatarUrl ? (
                            <img src={`${import.meta.env.VITE_API_URL}${profile.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <>{firstName[0]}{lastName[0]}</>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                            {profile.firstName} {profile.lastName}
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-surface text-brand-muted align-middle">
                                {profile.role}
                            </span>
                        </h3>
                        <p className="text-brand-muted text-sm">{profile.company.name}</p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-8">
                        <ImageUploader
                            endpoint="upload-avatar"
                            label="Profile Picture"
                            currentImageUrl={profile.avatarUrl ? `${import.meta.env.VITE_API_URL}${profile.avatarUrl}` : null}
                            onUploadSuccess={(url) => setProfile({ ...profile, avatarUrl: url })}
                        />
                    </div>
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1.5 flex items-center gap-2">
                                    <User className="w-4 h-4" /> First Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-brand-surface/50 border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1.5">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-brand-surface/50 border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-muted mb-1.5 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-brand-surface/50 border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors mb-2"
                            />

                            {/* Email Verification Status */}
                            {profile.emailVerified ? (
                                <p className="text-xs text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Email address verified
                                </p>
                            ) : (
                                <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-medium text-amber-500 mb-0.5">Verification Pending</p>
                                        <p className="text-[11px] text-amber-500/70">
                                            Please check {profile.email} for a verification link to fully activate your account features.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Message Alert */}
                        <AnimatePresence>
                            {profileMessage.text && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${profileMessage.type === 'error'
                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        }`}
                                >
                                    {profileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertTriangle className="w-4 h-4 mt-0.5" />}
                                    <span>{profileMessage.text}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-4 border-t border-white/5 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSavingProfile || (firstName === profile.firstName && lastName === profile.lastName && email === profile.email)}
                                className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            >
                                {isSavingProfile && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Security Section (Change Password) */}
            <div className="glass-panel overflow-hidden">
                <div className="border-b border-white/5 p-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-brand-primary" /> Security
                    </h3>
                    <p className="text-brand-muted text-sm mt-1">Update your password to keep your account secure.</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleChangePassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-brand-muted mb-1.5 flex items-center gap-2">
                                <Key className="w-4 h-4" /> Current Password
                            </label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-brand-surface/50 border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-muted mb-1.5 flex items-center gap-2">
                                <Key className="w-4 h-4" /> New Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-brand-surface/50 border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
                            />
                            <p className="text-[11px] text-brand-muted mt-1.5">Must be at least 8 characters.</p>
                        </div>

                        {/* Password Message Alert */}
                        <AnimatePresence>
                            {passwordMessage.text && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${passwordMessage.type === 'error'
                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        }`}
                                >
                                    {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertTriangle className="w-4 h-4 mt-0.5" />}
                                    <span>{passwordMessage.text}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-4 border-t border-white/5 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSavingPassword || !currentPassword || !newPassword}
                                className="bg-brand-surface border border-brand-border hover:border-brand-primary text-white px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            >
                                {isSavingPassword && <div className="w-4 h-4 border-2 border-brand-muted border-t-white rounded-full animate-spin" />}
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 2FA Setup Section */}
            <TwoFactorSetup />
        </div>
    );
}

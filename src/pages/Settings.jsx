import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Building, Key, Shield, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import ImageUploader from '../components/settings/ImageUploader';

export default function Settings() {
    const { token, user: authUser } = useAuth();

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingCompany, setIsSavingCompany] = useState(false);

    // Messages
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');
    const [companySuccess, setCompanySuccess] = useState('');
    const [companyError, setCompanyError] = useState('');

    // Form State
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '', // read-only
        currentPassword: '',
        newPassword: ''
    });

    const [companyForm, setCompanyForm] = useState({
        name: '',
        tier: '', // read-only
        status: '', // read-only
        logoUrl: null
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
<<<<<<< HEAD
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
=======
            const res = await fetch('http://localhost:4000/api/settings', {
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');

            setProfileForm({
                firstName: data.user.firstName || '',
                lastName: data.user.lastName || '',
                email: data.user.email || '',
                currentPassword: '',
                newPassword: ''
            });

            setCompanyForm({
                name: data.user.company?.name || '',
                tier: data.user.company?.subscriptionTier || 'NONE',
                status: data.user.company?.subscriptionStatus || 'inactive',
                logoUrl: data.user.company?.logoUrl || null
            });

        } catch (err) {
            console.error('Settings load error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        setIsSavingProfile(true);

        try {
            const body = {
                firstName: profileForm.firstName,
                lastName: profileForm.lastName,
            };

            if (profileForm.newPassword) {
                body.currentPassword = profileForm.currentPassword;
                body.newPassword = profileForm.newPassword;
            }

<<<<<<< HEAD
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/profile`, {
=======
            const res = await fetch('http://localhost:4000/api/settings/profile', {
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update profile');

            setProfileSuccess(data.message);
            // Clear password fields on success
            setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));

        } catch (err) {
            setProfileError(err.message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        setCompanyError('');
        setCompanySuccess('');
        setIsSavingCompany(true);

        try {
<<<<<<< HEAD
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/company`, {
=======
            const res = await fetch('http://localhost:4000/api/settings/company', {
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ companyName: companyForm.name })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update company');

            setCompanySuccess(data.message);
        } catch (err) {
            setCompanyError(err.message);
        } finally {
            setIsSavingCompany(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-64 rounded-md" />
                    <Skeleton className="h-4 w-48 rounded-md" />
                </div>

                <div className="space-y-6">
                    <div className="glass-panel p-8 space-y-6">
                        <Skeleton className="h-6 w-48" />
                        <div className="grid grid-cols-2 gap-6">
                            <Skeleton className="h-16 w-full rounded-md" />
                            <Skeleton className="h-16 w-full rounded-md" />
                        </div>
                        <Skeleton className="h-16 w-full rounded-md" />
                        <Skeleton className="h-40 w-full rounded-md mt-6" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Organization Settings</h2>
                <p className="text-brand-muted mt-2">Manage your personal profile and company details.</p>
            </div>

            <div className="space-y-6">

                {/* ---------------- Profile Section ---------------- */}
                <div className="glass-panel p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Personal Information</h3>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-surface border border-brand-border text-brand-muted">
                            <Shield className="w-3.5 h-3.5" />
                            Role: {authUser?.role}
                        </span>
                    </div>

                    {profileSuccess && (
                        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> {profileSuccess}
                        </div>
                    )}
                    {profileError && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                            {profileError}
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-2">First Name</label>
                                <div className="relative">
                                    <User className="w-5 h-5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        required
                                        value={profileForm.firstName}
                                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-[8px] text-white focus:outline-none focus:border-brand-primary"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-2">Last Name</label>
                                <div className="relative">
                                    <User className="w-5 h-5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        required
                                        value={profileForm.lastName}
                                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-[8px] text-white focus:outline-none focus:border-brand-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-muted mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-brand-muted/50 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    disabled
                                    value={profileForm.email}
                                    className="w-full pl-10 pr-4 py-2 bg-brand-surface/50 border border-brand-border rounded-[8px] text-brand-muted cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-brand-muted/70 mt-1.5 ml-1">Email cannot be changed online. Contact support.</p>
                        </div>

                        <div className="pt-6 border-t border-brand-border">
                            <h4 className="text-sm font-medium text-white mb-4">Change Password</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-brand-muted mb-2">Current Password</label>
                                    <div className="relative">
                                        <Key className="w-5 h-5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            value={profileForm.currentPassword}
                                            onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-[8px] text-white focus:outline-none focus:border-brand-primary placeholder:text-brand-muted/50 text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-muted mb-2">New Password</label>
                                    <div className="relative">
                                        <Key className="w-5 h-5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            placeholder="New 8+ char password"
                                            value={profileForm.newPassword}
                                            onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-[8px] text-white focus:outline-none focus:border-brand-primary placeholder:text-brand-muted/50 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSavingProfile}
                                className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-2 rounded-[8px] font-medium transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSavingProfile ? 'Saving...' : 'Save Profile Details'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ---------------- Company Section ---------------- */}
                <div className="glass-panel p-8">
                    <h3 className="text-lg font-bold text-white mb-6">Company Settings</h3>

                    {authUser?.role === 'ADMIN' && (
                        <div className="mb-8">
                            <ImageUploader
                                endpoint="upload-logo"
                                label="Company Logo"
<<<<<<< HEAD
                                currentImageUrl={companyForm.logoUrl ? `${import.meta.env.VITE_API_URL}${companyForm.logoUrl}` : null}
=======
                                currentImageUrl={companyForm.logoUrl ? `http://localhost:4000${companyForm.logoUrl}` : null}
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                                onUploadSuccess={(url) => setCompanyForm({ ...companyForm, logoUrl: url })}
                            />
                        </div>
                    )}

                    {companySuccess && (
                        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> {companySuccess}
                        </div>
                    )}
                    {companyError && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                            {companyError}
                        </div>
                    )}

                    <form onSubmit={handleCompanySubmit} className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-brand-muted mb-2">Company Name</label>
                            <div className="relative">
                                <Building className="w-5 h-5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    required
                                    disabled={authUser?.role !== 'ADMIN'}
                                    value={companyForm.name}
                                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-[8px] text-white focus:outline-none transition-colors ${authUser?.role === 'ADMIN'
                                        ? 'bg-brand-surface border-brand-border focus:border-brand-primary'
                                        : 'bg-brand-surface/50 border-brand-border/50 text-brand-muted cursor-not-allowed'
                                        }`}
                                />
                            </div>
                            {authUser?.role !== 'ADMIN' && (
                                <p className="text-xs text-brand-muted/70 mt-2">Only Administrators can change the company name.</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-2">
                            <div className="p-4 bg-brand-surface/30 border border-brand-border rounded-lg">
                                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Billing Tier</p>
                                <p className="text-white font-bold">{companyForm.tier}</p>
                            </div>
                            <div className="p-4 bg-brand-surface/30 border border-brand-border rounded-lg">
                                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Subscription Status</p>
                                <p className={`font-bold capitalize ${companyForm.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {companyForm.status}
                                </p>
                            </div>
                        </div>

                        {authUser?.role === 'ADMIN' && (
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSavingCompany}
                                    className="bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-white px-6 py-2 rounded-[8px] font-medium transition-colors disabled:opacity-50"
                                >
                                    {isSavingCompany ? 'Saving...' : 'Update Company'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Crown, Users, Building2, Cable, Activity, DollarSign, TrendingUp,
    Key, Megaphone, Globe, BookUser, Trash2, AlertTriangle, RefreshCw,
    Download, Zap, ShieldCheck, UserPlus, CheckCircle2, BarChart3,
    ArrowUpRight, ArrowDownRight, Sparkles, Clock, Wifi, WifiOff
} from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { format, formatDistanceToNow } from 'date-fns';

import RevenueAnalytics from '../components/admin/RevenueAnalytics';
import HealthTable from '../components/admin/HealthTable';
import InsightsPanel from '../components/admin/InsightsPanel';

// ── Helpers ──
const pct = (value) => `${value}%`;
const usd = (value) => `$${(value || 0).toLocaleString()}`;



// ── Stat Card ──
function StatCard({ icon: Icon, label, value, sub, iconColor = 'text-brand-primary', bg = 'bg-brand-surface' }) {
    return (
        <div className="p-5 rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface/50 border border-brand-border/50 group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-brand-muted font-medium text-xs mb-1">{label}</p>
                    <h3 className="text-2xl font-bold text-white">{value}</h3>
                    {sub && <p className="text-[11px] text-brand-muted mt-1">{sub}</p>}
                </div>
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 border border-brand-border`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ══════════════════════════════════════════════════════════════════════════════
export default function FounderHQ() {
    const { user, token, impersonate } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [impersonatingId, setImpersonatingId] = useState(null);
    const [deletingCompany, setDeletingCompany] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [togglingFlag, setTogglingFlag] = useState(null);
    const [syncTriggered, setSyncTriggered] = useState(false);
    const [error, setError] = useState('');

    const API = import.meta.env.VITE_API_URL;
    const headers = { 'Authorization': `Bearer ${token}` };

    const { data: adminData, isLoading, isError, error: queryError } = useQuery({
        queryKey: ['adminDashboard'],
        queryFn: async () => {
            const endpoints = [
                'stats', 'companies', 'revenue', 'flags',
                'integrations-health', 'pulse', 'users', 'signups'
            ];
            const responses = await Promise.all(
                endpoints.map(ep => fetch(`${API}/api/admin/${ep}`, { headers }))
            );

            const failed = responses.find(r => !r.ok);
            if (failed) throw new Error('Failed to fetch admin data.');

            const [stats, companies, revenue, flags, health, pulse, usersList, signups] =
                await Promise.all(responses.map(r => r.json()));

            return { stats, companies, revenue, flags, health, pulse, usersList, signups };
        },
        enabled: !!user && user.isSuperAdmin === true,
    });

    const stats = adminData?.stats;
    const companies = adminData?.companies || [];
    const revenue = adminData?.revenue;
    const flags = adminData?.flags || [];
    const health = adminData?.health;
    const pulse = adminData?.pulse || [];
    const usersList = adminData?.usersList || [];
    const signups = adminData?.signups;

    // ── Actions ──
    const handleImpersonate = async (companyId) => {
        try {
            setImpersonatingId(companyId);
            setError('');
            await impersonate(companyId);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to impersonate admin.');
            setImpersonatingId(null);
        }
    };

    const handleDeleteCompany = async (companyId) => {
        try {
            setError('');
            const res = await fetch(`${API}/api/admin/companies/${companyId}`, {
                method: 'DELETE', headers
            });
            if (!res.ok) throw new Error('Failed to delete company.');
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
            setDeletingCompany(null);
            setDeleteConfirmText('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleTriggerSync = async () => {
        try {
            setSyncTriggered(true);
            await fetch(`${API}/api/admin/trigger-sync`, {
                method: 'POST', headers
            });
            setTimeout(() => setSyncTriggered(false), 5000);
        } catch (err) {
            setError('Sync trigger failed.');
            setSyncTriggered(false);
        }
    };

    const handleToggleFlag = async (key, currentStatus, description) => {
        try {
            setTogglingFlag(key);
            setError('');
            const res = await fetch(`${API}/api/admin/flags`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, isEnabled: !currentStatus, description })
            });
            if (!res.ok) throw new Error('Failed to update feature flag.');
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
        } catch (err) {
            setError(err.message);
        } finally {
            setTogglingFlag(null);
        }
    };

    const handleCreateFlag = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const key = fd.get('key');
        if (!key) return;
        try {
            setError('');
            const res = await fetch(`${API}/api/admin/flags`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, isEnabled: false, description: fd.get('description') })
            });
            if (!res.ok) throw new Error('Failed to create flag.');
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
            e.target.reset();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateBroadcast = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const message = fd.get('message');
        if (!message) return;
        try {
            setError('');
            const res = await fetch(`${API}/api/admin/broadcast`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, type: fd.get('type') })
            });
            if (!res.ok) throw new Error('Failed to publish broadcast.');
            window.location.reload();
        } catch (err) {
            setError(err.message);
        }
    };

    const exportCompaniesCSV = () => {
        const csvRows = [
            'Name,Tier,Status,MRR,Users,Integrations,Health Score,Last Login',
            ...companies.map(c => `"${c.name}",${c.subscriptionTier},${c.subscriptionStatus},${c.mrr},${c.userCount},${c.integrationCount},${c.healthScore},${c.lastLogin || 'Never'}`)
        ];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `keystonedata-companies-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Guards ──
    if (!user || user.isSuperAdmin !== true) {
        return <Navigate to="/dashboard" replace />;
    }

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <div><Skeleton className="h-8 w-64 mb-2" /><Skeleton className="h-4 w-96" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
                </div>
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl max-w-2xl">
                <p className="text-red-400 font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* ═══ HEADER + QUICK ACTIONS ═══ */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Crown className="w-6 h-6 text-amber-400" />
                        Founder HQ
                    </h2>
                    <p className="text-brand-muted mt-1">Command center for Keystone Data platform operations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleTriggerSync}
                        disabled={syncTriggered}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-brand-surface border border-brand-border text-white rounded-lg hover:border-brand-primary transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncTriggered ? 'animate-spin' : ''}`} />
                        {syncTriggered ? 'Syncing…' : 'Trigger Sync'}
                    </button>
                    <button
                        onClick={exportCompaniesCSV}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-brand-surface border border-brand-border text-white rounded-lg hover:border-brand-primary transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{error}</div>
            )}

            {/* ═══ REVENUE ANALYTICS ═══ */}
            <RevenueAnalytics revenue={revenue} />

            {/* ═══ SYSTEM INSIGHTS & ANOMALIES ═══ */}
            <InsightsPanel companies={companies} />

            {/* ═══ GROWTH & ENGAGEMENT METRICS ═══ */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <StatCard icon={UserPlus} label="New Users (7d)" value={stats?.growth?.newUsers7d || 0} iconColor="text-emerald-400" bg="bg-emerald-500/10" />
                <StatCard icon={UserPlus} label="New Users (30d)" value={stats?.growth?.newUsers30d || 0} iconColor="text-blue-400" bg="bg-blue-500/10" />
                <StatCard icon={Building2} label="New Cos (7d)" value={stats?.growth?.newCompanies7d || 0} iconColor="text-purple-400" bg="bg-purple-500/10" />
                <StatCard icon={Building2} label="New Cos (30d)" value={stats?.growth?.newCompanies30d || 0} iconColor="text-indigo-400" bg="bg-indigo-500/10" />
                <StatCard icon={CheckCircle2} label="Verified" value={pct(stats?.engagement?.verifiedRate)} iconColor="text-emerald-400" bg="bg-emerald-500/10" />
                <StatCard icon={ShieldCheck} label="2FA Enabled" value={pct(stats?.engagement?.twoFactorRate)} iconColor="text-amber-400" bg="bg-amber-500/10" />
                <StatCard icon={BarChart3} label="Onboarded" value={pct(stats?.engagement?.onboardingRate)} iconColor="text-brand-primary" bg="bg-brand-primary/10" />
                <StatCard icon={Activity} label="Active (7d)" value={stats?.engagement?.activeUsersLast7d || 0} iconColor="text-pink-400" bg="bg-pink-500/10" />
            </div>

            {/* ═══ PLATFORM OVERVIEW CARDS ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-surface border border-brand-primary/20">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-brand-primary font-medium text-xs mb-1 flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4" /> Live MRR
                            </p>
                            <h3 className="text-3xl font-bold text-white">{usd(revenue?.mrr)}</h3>
                            <p className="text-xs text-brand-muted mt-2">
                                {revenue?.activeSubs || 0} active · {revenue?.churnRate || 0}% churn
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                </div>
                <StatCard icon={Users} label="Total Users" value={stats?.totalUsers?.toLocaleString() || 0} iconColor="text-emerald-400" bg="bg-emerald-500/10" />
                <StatCard icon={Building2} label="Total Companies" value={stats?.totalCompanies?.toLocaleString() || 0} iconColor="text-blue-400" bg="bg-blue-500/10" />
                <StatCard icon={Cable} label="Active Integrations" value={stats?.activeIntegrations?.toLocaleString() || 0} iconColor="text-purple-400" bg="bg-purple-500/10" />
            </div>

            {/* ═══ RECENT SIGNUPS FEED ═══ */}
            {signups && (signups.companies?.length > 0 || signups.users?.length > 0) && (
                <div className="glass-panel overflow-hidden">
                    <div className="p-6 border-b border-brand-border flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <UserPlus className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">New This Week</h3>
                            <p className="text-sm text-brand-muted">Companies and users that signed up in the last 7 days.</p>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* New Companies */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">New Companies ({signups.companies?.length || 0})</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                {signups.companies?.map(c => (
                                    <div key={c.id} className="p-3 rounded-lg bg-brand-bg border border-brand-border/50 flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-medium text-white">{c.name}</span>
                                            <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${c.tier === 'GROWTH' ? 'bg-amber-500/20 text-amber-400' : c.tier === 'STARTER' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-surface text-brand-muted'}`}>
                                                {c.tier}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-brand-muted">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                                    </div>
                                ))}
                                {(!signups.companies || signups.companies.length === 0) && (
                                    <p className="text-sm text-brand-muted text-center py-4">No new companies this week.</p>
                                )}
                            </div>
                        </div>
                        {/* New Users */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">New Users ({signups.users?.length || 0})</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                {signups.users?.map(u => (
                                    <div key={u.id} className="p-3 rounded-lg bg-brand-bg border border-brand-border/50 flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-medium text-white">{u.name}</span>
                                            <span className="text-xs text-brand-muted ml-2">{u.company}</span>
                                        </div>
                                        <span className="text-[11px] text-brand-muted">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</span>
                                    </div>
                                ))}
                                {(!signups.users || signups.users.length === 0) && (
                                    <p className="text-sm text-brand-muted text-center py-4">No new users this week.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ API HEALTH DASHBOARD ═══ */}
            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-brand-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                            <Cable className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">API Health & Sync Status</h3>
                            <p className="text-sm text-brand-muted">Cross-tenant integration pipeline success rates.</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 rounded-xl bg-brand-bg border border-brand-border text-center">
                            <p className="text-sm font-medium text-brand-muted mb-1">Total Connections</p>
                            <p className="text-2xl font-bold text-white">{health?.metrics?.total || 0}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-bg border border-emerald-500/20 text-center">
                            <p className="text-sm font-medium text-emerald-400 mb-1">Healthy Syncs</p>
                            <p className="text-2xl font-bold text-white">{health?.metrics?.successful || 0}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-bg border border-brand-border text-center">
                            <p className="text-sm font-medium text-brand-muted mb-1">Pending Syncs</p>
                            <p className="text-2xl font-bold text-white">{health?.metrics?.pending || 0}</p>
                        </div>
                        <div className={`p-4 rounded-xl border text-center ${health?.metrics?.failed > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-brand-bg border-brand-border'}`}>
                            <p className={`text-sm font-medium mb-1 ${health?.metrics?.failed > 0 ? 'text-red-400' : 'text-brand-muted'}`}>Failed Syncs</p>
                            <div className="flex items-baseline justify-center gap-2">
                                <p className="text-2xl font-bold text-white">{health?.metrics?.failed || 0}</p>
                                <span className={`text-xs font-semibold ${health?.metrics?.failureRate > 5 ? 'text-red-400' : 'text-brand-muted'}`}>
                                    ({health?.metrics?.failureRate || 0}%)
                                </span>
                            </div>
                        </div>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Recent Sync Errors</h4>
                    {health?.recentErrors?.length === 0 ? (
                        <div className="text-center py-8 text-brand-muted bg-brand-bg rounded-xl border border-brand-border">
                            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>All integrations operating normally.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {health?.recentErrors?.map((err, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-brand-bg border border-red-500/20 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-surface text-brand-muted uppercase tracking-wider">{err.platformName}</span>
                                            <span className="text-sm font-medium text-white">{err.companyName}</span>
                                        </div>
                                        <p className="text-xs text-brand-muted font-mono">{err.error || 'Unknown sync error occurred.'}</p>
                                    </div>
                                    <div className="text-xs text-brand-muted/70 whitespace-nowrap">
                                        {format(new Date(err.lastAttempt || new Date()), 'MMM d, h:mm a')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ COMPANY HEALTH TABLE ═══ */}
            <HealthTable
                companies={companies}
                handleImpersonate={handleImpersonate}
                impersonatingId={impersonatingId}
                setDeletingCompany={setDeletingCompany}
            />

            {/* ═══ GLOBAL USER DIRECTORY ═══ */}
            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-brand-border flex items-center gap-3">
                    <div className="p-2 bg-brand-surface rounded-lg"><BookUser className="w-4 h-4 text-emerald-400" /></div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Global User Directory</h3>
                        <p className="text-sm text-brand-muted">Cross-tenant list of all platform individuals.</p>
                    </div>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-sm text-brand-muted sticky-header">
                        <thead className="text-xs uppercase bg-brand-surface border-b border-brand-border text-brand-muted/70 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">User</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Tenant (Company)</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Role</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Date Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/50">
                            {usersList.length > 0 ? usersList.map((u) => (
                                <tr key={u.id} className="hover:bg-brand-surface/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{u.firstName} {u.lastName}</span>
                                            <span className="text-xs text-brand-muted/70">{u.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white">{u.companyName}</td>
                                    <td className="px-6 py-4">
                                        {u.isSuperAdmin ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 uppercase tracking-wide">
                                                <Crown className="w-3 h-3" /> Founder
                                            </span>
                                        ) : (
                                            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${u.role === 'ADMIN' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-surface/50 text-brand-muted'}`}>
                                                {u.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-brand-muted">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ═══ GLOBAL AUDIT PULSE ═══ */}
            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-brand-border flex items-center gap-3">
                    <div className="p-2 bg-brand-surface rounded-lg border border-brand-border"><Globe className="w-5 h-5 text-emerald-400" /></div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Global Audit Pulse</h3>
                        <p className="text-sm text-brand-muted">Real-time cross-tenant activity log.</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="max-h-96 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {pulse.length === 0 ? (
                            <p className="text-brand-muted text-center py-4">No recent activity on the platform.</p>
                        ) : (
                            pulse.map((log) => (
                                <div key={log.id} className="p-4 rounded-xl bg-brand-surface/30 border border-brand-border/50 hover:border-brand-border transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-white whitespace-nowrap">{log.user?.firstName} {log.user?.lastName}</span>
                                            <span className="text-brand-muted text-sm whitespace-nowrap">({log.user?.email})</span>
                                            <span className="text-brand-muted/50 text-sm hidden sm:inline">from</span>
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-brand-surface text-brand-primary border border-brand-primary/20">{log.company?.name}</span>
                                        </div>
                                        <span className="text-xs text-brand-muted whitespace-nowrap ml-4">{format(new Date(log.createdAt), 'MMM d, h:mm a')}</span>
                                    </div>
                                    <p className="text-sm text-brand-muted">
                                        Performed action: <span className="font-mono text-white text-xs px-1.5 py-0.5 bg-brand-surface rounded">{log.action}</span>
                                    </p>
                                    {log.details && Object.keys(log.details).length > 0 && (
                                        <div className="mt-2 text-xs font-mono text-brand-muted/70 bg-brand-bg p-2 rounded border border-brand-border/50 overflow-x-auto">
                                            {JSON.stringify(log.details)}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ BROADCAST + FEATURE FLAGS ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Broadcast System */}
                <div className="glass-panel overflow-hidden">
                    <div className="p-6 border-b border-brand-border flex items-center gap-3">
                        <div className="p-2 bg-brand-surface rounded-lg border border-brand-border"><Megaphone className="w-5 h-5 text-red-400" /></div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Global Broadcast</h3>
                            <p className="text-sm text-brand-muted">Publish alerts to all users.</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleCreateBroadcast} className="space-y-4">
                            <textarea
                                name="message"
                                placeholder="e.g. Scheduled maintenance in 1 hour."
                                rows={3}
                                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary/50 resize-none"
                                required
                            />
                            <div className="flex gap-4">
                                <select name="type" className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary/50">
                                    <option value="INFO">Informational (Blue)</option>
                                    <option value="WARNING">Warning (Yellow)</option>
                                    <option value="CRITICAL">Critical (Red)</option>
                                </select>
                                <button type="submit" className="py-2.5 px-6 bg-red-600/90 text-white text-sm font-bold rounded-lg hover:bg-red-500 transition-colors whitespace-nowrap">
                                    Publish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Feature Flags */}
                <div className="glass-panel overflow-hidden">
                    <div className="p-6 border-b border-brand-border flex items-center gap-3">
                        <div className="p-2 bg-brand-surface rounded-lg border border-brand-border"><Key className="w-5 h-5 text-amber-400" /></div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Feature Flags</h3>
                            <p className="text-sm text-brand-muted">Toggle platform features globally.</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <form onSubmit={handleCreateFlag} className="flex gap-2">
                            <input type="text" name="key" placeholder="flag_key" className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary/50" required />
                            <input type="text" name="description" placeholder="Description" className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary/50" />
                            <button type="submit" className="px-4 py-2 bg-brand-surface border border-brand-border text-white text-sm font-bold rounded-lg hover:border-brand-primary transition-colors">Add</button>
                        </form>
                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                            {flags.length === 0 ? (
                                <div className="text-center py-6 text-brand-muted border border-dashed border-brand-border rounded-xl text-sm">No flags created yet.</div>
                            ) : (
                                flags.map(flag => (
                                    <div key={flag.id} className="p-3 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-between">
                                        <div>
                                            <p className="font-mono text-sm text-brand-primary">{flag.key}</p>
                                            {flag.description && <p className="text-xs text-brand-muted line-clamp-1">{flag.description}</p>}
                                        </div>
                                        <button
                                            onClick={() => handleToggleFlag(flag.key, flag.isEnabled, flag.description)}
                                            disabled={togglingFlag === flag.key}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${flag.isEnabled ? 'bg-emerald-500' : 'bg-brand-surface'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${flag.isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
            {deletingCompany && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-brand-bg border border-red-500/30 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4 text-red-500">
                                <AlertTriangle className="w-8 h-8" />
                                <h3 className="text-xl font-bold">The Data Destructor</h3>
                            </div>
                            <p className="text-sm text-brand-muted mb-4 leading-relaxed">
                                You are about to permanently delete <strong className="text-white">{deletingCompany.name}</strong>.
                                This will cascade and completely wipe all associated users, metrics, integrations, and audit logs. This action <strong>cannot be undone</strong>.
                            </p>
                            <label className="block text-sm font-medium text-white mb-2">
                                Type <strong>{deletingCompany.name}</strong> to confirm:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2 mb-6 text-white text-sm focus:outline-none focus:border-red-500/50"
                                placeholder={deletingCompany.name}
                            />
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { setDeletingCompany(null); setDeleteConfirmText(''); }}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-brand-surface hover:bg-brand-surface/80 rounded-lg transition-colors"
                                >Cancel</button>
                                <button
                                    onClick={() => handleDeleteCompany(deletingCompany.id)}
                                    disabled={deleteConfirmText !== deletingCompany.name}
                                    className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >PERMANENTLY DELETE</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, Users, Building2, Cable, Activity, DollarSign, TrendingUp, Key, Megaphone, Globe, BookUser, Trash2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { format } from 'date-fns';

export default function FounderHQ() {
    const { user, token, impersonate } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [revenue, setRevenue] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [flags, setFlags] = useState([]);
    const [broadcasts, setBroadcasts] = useState([]);
    const [health, setHealth] = useState(null);
    const [pulse, setPulse] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [impersonatingId, setImpersonatingId] = useState(null);
    const [deletingCompany, setDeletingCompany] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [togglingFlag, setTogglingFlag] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Double check within component just in case
        if (!user || user.isSuperAdmin !== true) return;

        const fetchData = async () => {
            try {
                const [statsRes, companiesRes, revRes, flagsRes, healthRes, pulseRes, usersRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/admin/companies`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/admin/revenue`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/admin/flags`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/admin/integrations-health`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/admin/pulse`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (!statsRes.ok || !companiesRes.ok || !revRes.ok || !flagsRes.ok || !healthRes.ok || !pulseRes.ok || !usersRes.ok) {
                    throw new Error('Failed to fetch admin data.');
                }

                const statsData = await statsRes.json();
                const companiesData = await companiesRes.json();
                const revData = await revRes.json();
                const flagsData = await flagsRes.json();
                const healthData = await healthRes.json();
                const pulseData = await pulseRes.json();
                const usersData = await usersRes.json();

                setStats(statsData);
                setCompanies(companiesData);
                setRevenue(revData);
                setFlags(flagsData);
                setHealth(healthData);
                setPulse(pulseData);
                setUsersList(usersData);
            } catch (err) {
                console.error(err);
                setError('Failed to load Super Admin dashboard.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, token]);

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
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/companies/${companyId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete company.');

            // Remove from local state
            setCompanies(companies.filter(c => c.id !== companyId));
            setDeletingCompany(null);
            setDeleteConfirmText('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleToggleFlag = async (key, currentStatus, description) => {
        try {
            setTogglingFlag(key);
            setError('');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/flags`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ key, isEnabled: !currentStatus, description })
            });

            if (!res.ok) throw new Error('Failed to update feature flag.');
            const data = await res.json();

            setFlags(flags.map(f => f.key === key ? { ...f, isEnabled: !currentStatus } : f));
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
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/flags`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ key, isEnabled: false, description: fd.get('description') })
            });

            if (!res.ok) throw new Error('Failed to create flag.');
            const data = await res.json();

            // Re-fetch flags to get ID/timestamp, or simply append
            const flagMap = new Set(flags.map(f => f.key));
            if (!flagMap.has(key)) {
                setFlags([...flags, data.flag].sort((a, b) => a.key.localeCompare(b.key)));
            } else {
                setFlags(flags.map(f => f.key === key ? data.flag : f));
            }
            e.target.reset();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateBroadcast = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const message = fd.get('message');
        const type = fd.get('type');

        if (!message) return;

        try {
            setError('');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message, type })
            });

            if (!res.ok) throw new Error('Failed to publish broadcast.');
            const data = await res.json();

            // Reload the entire page to let the new broadcast show up in DashboardLayout too
            window.location.reload();
        } catch (err) {
            setError(err.message);
        }
    };

    // Strict frontend protection
    if (!user || user.isSuperAdmin !== true) {
        return <Navigate to="/dashboard" replace />;
    }

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl max-w-2xl">
                <p className="text-red-400 font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Crown className="w-6 h-6 text-amber-400" />
                    Founder HQ
                </h2>
                <p className="text-brand-muted mt-1">Global platform overview and tenant management.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* MRR Card */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-surface border border-brand-primary/20 relative overflow-hidden group">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-brand-primary font-medium text-sm mb-1 flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4" /> Live MRR
                            </p>
                            <h3 className="text-3xl font-bold text-white">
                                ${revenue?.mrr?.toLocaleString() || 0}
                            </h3>
                            <p className="text-xs text-brand-muted mt-2">
                                {revenue?.activeSubs || 0} active subscriptions ({revenue?.churnRate || 0}% churn)
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface/50 border border-brand-border/50 relative overflow-hidden group">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-brand-muted font-medium text-sm mb-1">Total Users</p>
                            <h3 className="text-3xl font-bold text-white">{stats?.totalUsers?.toLocaleString() || 0}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface/50 border border-brand-border/50 relative overflow-hidden group">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-brand-muted font-medium text-sm mb-1">Total Companies</p>
                            <h3 className="text-3xl font-bold text-white">{stats?.totalCompanies?.toLocaleString() || 0}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface/50 border border-brand-border/50 relative overflow-hidden group">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-brand-muted font-medium text-sm mb-1">Active Integrations</p>
                            <h3 className="text-3xl font-bold text-white">{stats?.activeIntegrations?.toLocaleString() || 0}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <Cable className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* API Health Dashboard */}
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
                    {/* Health Metrics Summary */}
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

                    {/* Recent Errors Log */}
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
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-surface text-brand-muted uppercase tracking-wider">
                                                {err.platformName}
                                            </span>
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

            {/* Global User Directory Table */}
            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-brand-border flex items-center gap-3">
                    <div className="p-2 bg-brand-surface rounded-lg">
                        <BookUser className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Global User Directory</h3>
                        <p className="text-sm text-brand-muted">Cross-tenant list of all platform individuals.</p>
                    </div>
                </div>

                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-sm text-brand-muted sticky-header">
                        <thead className="text-xs uppercase bg-brand-surface border-b border-brand-border text-brand-muted/70 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">User</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Tenant (Company)</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-right">Date Joined</th>
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
                                    <td className="px-6 py-4 text-white">
                                        {u.companyName}
                                    </td>
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
                                    <td className="px-6 py-4 text-right">
                                        {format(new Date(u.createdAt), 'MMM d, yyyy')}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-brand-muted">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Companies Leaderboard Table */}
            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-brand-border flex items-center gap-3">
                    <div className="p-2 bg-brand-surface rounded-lg">
                        <Activity className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Platform Tenants & Leaderboard</h3>
                        <p className="text-sm text-brand-muted">All active companies ranked by MRR.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-brand-muted">
                        <thead className="text-xs uppercase bg-brand-surface/30 border-b border-brand-border text-brand-muted/70">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Company ID</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Tier / Status</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">MRR</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Members</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/50">
                            {companies.length > 0 ? companies.map((comp) => (
                                <tr key={comp.id} className="hover:bg-brand-surface/20 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-brand-muted/50">{comp.id}</td>
                                    <td className="px-6 py-4 font-medium text-white">{comp.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${comp.subscriptionTier === 'GROWTH' ? 'bg-amber-500/20 text-amber-500' :
                                                comp.subscriptionTier === 'STARTER' ? 'bg-brand-primary/20 text-brand-primary' :
                                                    'bg-brand-surface text-brand-muted'
                                                }`}>
                                                {comp.subscriptionTier}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wide text-brand-muted/70">
                                                {comp.subscriptionStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        ${comp.mrr}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-surface text-brand-muted">
                                            {comp.userCount} {comp.userCount === 1 ? 'user' : 'users'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleImpersonate(comp.id)}
                                                disabled={impersonatingId === comp.id}
                                                className="px-3 py-1.5 text-xs font-semibold bg-brand-surface border border-brand-border text-white rounded hover:border-brand-primary transition-colors disabled:opacity-50"
                                            >
                                                {impersonatingId === comp.id ? 'Loading...' : 'Impersonate'}
                                            </button>
                                            <button
                                                onClick={() => setDeletingCompany(comp)}
                                                className="p-1.5 text-brand-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-brand-muted">
                                        No companies found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Global Audit Trail (Pulse) */}
            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-brand-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                            <Globe className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Global Audit Pulse</h3>
                            <p className="text-sm text-brand-muted">Real-time cross-tenant activity log.</p>
                        </div>
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
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-brand-surface text-brand-primary border border-brand-primary/20">
                                                {log.company?.name}
                                            </span>
                                        </div>
                                        <span className="text-xs text-brand-muted whitespace-nowrap ml-4">
                                            {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                                        </span>
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

            {/* Global Broadcast System */}
            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-brand-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                            <Megaphone className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Global Broadcast System</h3>
                            <p className="text-sm text-brand-muted">Publish real-time alerts and announcements to all active users.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 max-w-2xl">
                    <form onSubmit={handleCreateBroadcast} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-muted mb-1">Broadcast Message</label>
                            <textarea
                                name="message"
                                placeholder="e.g. Scheduled maintenance in 1 hour. Expect 5 minutes of downtime."
                                rows={3}
                                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary/50 focus:bg-brand-surface/50 resize-none"
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-brand-muted mb-1">Alert Type</label>
                                <select
                                    name="type"
                                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary/50 focus:bg-brand-surface/50"
                                >
                                    <option value="INFO">Informational (Blue)</option>
                                    <option value="WARNING">Warning (Yellow)</option>
                                    <option value="CRITICAL">Critical (Red)</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="py-2.5 px-6 bg-red-600/90 text-white text-sm font-bold rounded-lg hover:bg-red-500 transition-colors whitespace-nowrap"
                                >
                                    Publish Broadcast
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Feature Flags System */}
            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-brand-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                            <Key className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Feature Flag Engine</h3>
                            <p className="text-sm text-brand-muted">Globally enable or disable platform features.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add new flag form */}
                    <div className="lg:col-span-1">
                        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Create New Flag</h4>
                        <form onSubmit={handleCreateFlag} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1">Flag Key</label>
                                <input
                                    type="text"
                                    name="key"
                                    placeholder="e.g. enable_integrations"
                                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary/50 focus:bg-brand-surface/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="Brief explanation of this flag"
                                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary/50 focus:bg-brand-surface/50"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-brand-surface border border-brand-border text-white text-sm font-bold rounded-lg hover:border-brand-primary transition-colors"
                            >
                                Add Flag
                            </button>
                        </form>
                    </div>

                    {/* Existing flags list */}
                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Active Flags</h4>

                        {flags.length === 0 ? (
                            <div className="text-center py-8 text-brand-muted border border-dashed border-brand-border rounded-xl">
                                No feature flags created yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {flags.map(flag => (
                                    <div key={flag.id} className="p-4 rounded-xl bg-brand-bg border border-brand-border flex items-start justify-between">
                                        <div>
                                            <p className="font-mono text-sm text-brand-primary mb-1">{flag.key}</p>
                                            {flag.description && <p className="text-xs text-brand-muted line-clamp-2">{flag.description}</p>}
                                        </div>
                                        <button
                                            onClick={() => handleToggleFlag(flag.key, flag.isEnabled, flag.description)}
                                            disabled={togglingFlag === flag.key}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${flag.isEnabled ? 'bg-emerald-500' : 'bg-brand-surface'}`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${flag.isEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Strict Delete Confirmation Modal */}
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
                                    onClick={() => {
                                        setDeletingCompany(null);
                                        setDeleteConfirmText('');
                                    }}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-brand-surface hover:bg-brand-surface/80 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteCompany(deletingCompany.id)}
                                    disabled={deleteConfirmText !== deletingCompany.name}
                                    className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    PERMANENTLY DELETE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

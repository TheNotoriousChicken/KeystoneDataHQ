import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { subDays, format } from 'date-fns';
import { DollarSign, Target, MousePointerClick, ShoppingCart, RefreshCw, TrendingUp, Plug, TrendingDown, Users, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '../components/Skeleton';

// Format currency
const fmt = (val) => {
    if (val == null) return '—';
    return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtShort = (val) => {
    if (val == null) return '—';
    if (val >= 1000) return '$' + (val / 1000).toFixed(1) + 'k';
    return '$' + Number(val).toFixed(2);
};

// Sub-component for delta badges
const DeltaBadge = ({ value, invertColors = false }) => {
    if (value == null) return null;
    const isPositive = value >= 0;

    // Some metrics (like CAC) are better when they go down.
    const isGood = invertColors ? !isPositive : isPositive;

    const colorClass = isGood ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10';
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
            <Icon className="w-3 h-3" />
            {Math.abs(value).toFixed(1)}%
        </div>
    );
};

export default function Dashboard() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState([subDays(new Date(), 30), new Date()]);
    const [startDate, endDate] = dateRange;

    // --- Initial fetch on mount & when date changes ---
    useEffect(() => {
        fetchDashboard();
    }, [startDate, endDate]);

    const fetchDashboard = async () => {
        try {
            setIsLoading(true);
            setError(null);

            let url = 'http://localhost:4000/api/dashboard';
            if (startDate && endDate) {
                const query = new URLSearchParams({
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }).toString();
                url += `?${query}`;
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard.');
            setDashboardData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Manual sync ---
    const handleSync = async () => {
        try {
            setIsSyncing(true);
            setError(null);
            const res = await fetch('http://localhost:4000/api/dashboard/sync', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Sync failed.');

            // Re-fetch after sync to get updated history
            await fetchDashboard();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSyncing(false);
        }
    };

    const latest = dashboardData?.latest;
    const history = dashboardData?.history || [];

    // Transform history for the chart
    const chartData = history.map((entry) => ({
        name: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: entry.totalRevenue || 0,
        spend: entry.adSpend || 0,
    }));

    // --- Loading State ---
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    // --- Empty State (no cached data yet) ---
    if (!latest) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="glass-panel p-12 max-w-lg text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto">
                        <Plug className="w-8 h-8 text-brand-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">No data yet</h2>
                        <p className="text-brand-muted leading-relaxed">
                            Connect your Shopify store and Meta Ads account on the Integrations page, then hit
                            <span className="text-brand-primary font-semibold"> Sync Now</span> to pull your first metrics.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate('/dashboard/integrations')}
                            className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded-lg transition-all shadow-lg shadow-brand-primary/20"
                        >
                            Go to Integrations
                        </button>
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="px-6 py-2.5 bg-brand-surface border border-brand-border text-white font-semibold rounded-lg hover:border-brand-primary transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                    </div>
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
                    )}
                </div>
            </div>
        );
    }

    // --- Main Dashboard ---
    return (
        <div className="space-y-6">
            {/* Header with Sync & Date Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
                    <p className="text-brand-muted text-sm mt-1">
                        Last synced: {new Date(latest.createdAt || latest.date).toLocaleString()}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2 flex items-center">
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => setDateRange(update)}
                            className="bg-transparent text-white text-sm outline-none w-[200px] cursor-pointer"
                            wrapperClassName="date_picker"
                            dateFormat="MMM d, yyyy"
                            maxDate={new Date()}
                            placeholderText="Select date range"
                        />
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-surface border border-brand-border rounded-lg text-white font-semibold text-sm hover:border-brand-primary transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Revenue */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                            <DollarSign className="w-5 h-5 text-brand-primary" />
                        </div>
                        {dashboardData?.deltas && <DeltaBadge value={dashboardData.deltas.revenue} />}
                    </div>
                    <p className="text-sm font-medium text-brand-muted mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-white">{fmt(dashboardData?.periodTotals?.revenue ?? latest?.totalRevenue)}</h3>
                </div>

                {/* Ad Spend */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-amber-500" />
                        </div>
                        {dashboardData?.deltas && <DeltaBadge value={dashboardData.deltas.adSpend} invertColors={true} />}
                    </div>
                    <p className="text-sm font-medium text-brand-muted mb-1">Ad Spend</p>
                    <h3 className="text-3xl font-bold text-white">{fmt(dashboardData?.periodTotals?.adSpend ?? latest?.adSpend)}</h3>
                </div>

                {/* ROAS */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-brand-secondary/10 rounded-lg">
                            <Target className="w-5 h-5 text-brand-secondary" />
                        </div>
                        {dashboardData?.deltas && <DeltaBadge value={dashboardData.deltas.roas} />}
                    </div>
                    <p className="text-sm font-medium text-brand-muted mb-1">True ROAS</p>
                    <h3 className="text-3xl font-bold text-white">
                        {dashboardData?.periodTotals?.roas != null ? `${dashboardData.periodTotals.roas.toFixed(2)}x` : '—'}
                    </h3>
                </div>

                {/* Orders */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-fuchsia-500/10 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-fuchsia-500" />
                        </div>
                        {dashboardData?.deltas && <DeltaBadge value={dashboardData.deltas.orders} />}
                    </div>
                    <p className="text-sm font-medium text-brand-muted mb-1">Total Orders</p>
                    <h3 className="text-3xl font-bold text-white">
                        {dashboardData?.periodTotals?.orders != null ? dashboardData.periodTotals.orders.toLocaleString() : '—'}
                    </h3>
                </div>

                {/* Visitors (GA4) */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        {dashboardData?.deltas && <DeltaBadge value={dashboardData.deltas.visitors} />}
                    </div>
                    <p className="text-sm font-medium text-brand-muted mb-1">Website Visitors</p>
                    <h3 className="text-3xl font-bold text-white">
                        {dashboardData?.periodTotals?.visitors != null ? dashboardData.periodTotals.visitors.toLocaleString() : '—'}
                    </h3>
                </div>

                {/* Email Revenue (Klaviyo) */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-[#20C6B6]/10 rounded-lg">
                            <Mail className="w-5 h-5 text-[#20C6B6]" />
                        </div>
                        {dashboardData?.deltas && <DeltaBadge value={dashboardData.deltas.emailRevenue} />}
                    </div>
                    <p className="text-sm font-medium text-brand-muted mb-1">Email Revenue</p>
                    <h3 className="text-3xl font-bold text-white">
                        {dashboardData?.periodTotals?.emailRevenue != null ? fmt(dashboardData.periodTotals.emailRevenue) : '—'}
                    </h3>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue vs Ad Spend Chart */}
                <div className="glass-panel p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-6">Revenue vs Ad Spend (Last 30 Days)</h3>
                    {chartData.length > 0 ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => fmtShort(val)} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                                        itemStyle={{ color: '#FFFFFF' }}
                                        formatter={(val) => fmt(val)}
                                    />
                                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4, fill: '#06B6D4', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="spend" name="Ad Spend" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-brand-muted">
                            Sync data to see your trend chart.
                        </div>
                    )}
                </div>

                {/* KPI Summary Panel */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Key Metrics Summary</h3>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between p-3 bg-brand-surface/50 rounded-lg border border-brand-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 text-brand-primary" />
                                </div>
                                <span className="text-sm font-medium text-brand-muted">Revenue</span>
                            </div>
                            <span className="text-sm font-bold text-white">{fmt(latest.totalRevenue)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-brand-surface/50 rounded-lg border border-brand-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-amber-500" />
                                </div>
                                <span className="text-sm font-medium text-brand-muted">Ad Spend</span>
                            </div>
                            <span className="text-sm font-bold text-white">{fmt(latest.adSpend)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-brand-surface/50 rounded-lg border border-brand-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-secondary/10 flex items-center justify-center">
                                    <Target className="w-4 h-4 text-brand-secondary" />
                                </div>
                                <span className="text-sm font-medium text-brand-muted">ROAS</span>
                            </div>
                            <span className="text-sm font-bold text-white">{latest.roas != null ? `${latest.roas.toFixed(2)}x` : '—'}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-brand-surface/50 rounded-lg border border-brand-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                    <MousePointerClick className="w-4 h-4 text-rose-500" />
                                </div>
                                <span className="text-sm font-medium text-brand-muted">Blended CAC</span>
                            </div>
                            <span className="text-sm font-bold text-white">{latest.cac != null ? fmt(latest.cac) : '—'}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-brand-surface/50 rounded-lg border border-brand-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 flex items-center justify-center">
                                    <ShoppingCart className="w-4 h-4 text-fuchsia-500" />
                                </div>
                                <span className="text-sm font-medium text-brand-muted">Orders</span>
                            </div>
                            <span className="text-sm font-bold text-white">{latest.totalOrders?.toLocaleString() || '—'}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-brand-surface/50 rounded-lg border border-brand-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-blue-500" />
                                </div>
                                <span className="text-sm font-medium text-brand-muted">Visitors</span>
                            </div>
                            <span className="text-sm font-bold text-white">{latest.visitors?.toLocaleString() || '—'}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-brand-surface/50 rounded-lg border border-brand-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#20C6B6]/10 flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-[#20C6B6]" />
                                </div>
                                <span className="text-sm font-medium text-brand-muted">Email Revenue</span>
                            </div>
                            <span className="text-sm font-bold text-white">{latest.emailRevenue != null ? fmt(latest.emailRevenue) : '—'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

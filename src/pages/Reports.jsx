import { useAuth } from '../context/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import Papa from 'papaparse';
import { FileText, Download, TrendingUp, TrendingDown, Minus, DollarSign, Target, ShoppingCart, MousePointerClick } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { useDateStore } from '../store/useDateStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Date formatter
const fmtDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Currency formatter
const fmtC = (val) => {
    if (val == null) return '—';
    return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function Reports() {
    const { token } = useAuth();

    // Global Date Store
    const { dateRange, setDateRange } = useDateStore();
    const [startDate, endDate] = dateRange;

    // --- React Query: Fetch Reports ---
    const { data: reportData, isLoading, error } = useQuery({
        queryKey: ['reports', startDate?.toISOString(), endDate?.toISOString()],
        queryFn: async () => {
            let url = `${import.meta.env.VITE_API_URL}/api/reports`;
            if (startDate && endDate) {
                const startStr = startDate.toISOString();
                const endStr = endDate.toISOString();
                url += `?startDate=${startStr}&endDate=${endStr}`;
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch report');

            return data;
        },
        enabled: !!token,
    });

    const handleExportCSV = () => {
        if (!reportData || reportData.dailyMetrics.length === 0) return;

        // Map data rows
        const data = reportData.dailyMetrics.map(row => ({
            'Date': row.date.split('T')[0],
            'Total Revenue': row.totalRevenue || 0,
            'Ad Spend': row.adSpend || 0,
            'Total Orders': row.totalOrders || 0,
            'Blended ROAS': row.roas || 0,
            'Blended CAC': row.cac || 0
        }));

        // Generate CSV using papaparse
        const csvContent = Papa.unparse(data);

        // Create Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `keystone_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderTrendIcon = (trend) => {
        if (trend === 'up') return <TrendingUp className="w-5 h-5 text-emerald-400" />;
        if (trend === 'down') return <TrendingDown className="w-5 h-5 text-rose-400" />;
        return <Minus className="w-5 h-5 text-brand-muted" />;
    };

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-64 rounded-md" />
                        <Skeleton className="h-4 w-48 rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>

                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        );
    }

    const { summary, dailyMetrics } = reportData || {};

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Performance Reports</h2>
                    <p className="text-brand-muted mt-2">Aggregated metrics and actionable insights.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2 flex items-center">
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => setDateRange(update)}
                            className="bg-transparent text-white text-sm focus:outline-none w-48 font-medium placeholder-brand-muted cursor-pointer"
                            placeholderText="Select date range"
                            dateFormat="MMM d, yyyy"
                            maxDate={new Date()}
                        />
                    </div>
                    <button
                        onClick={handleExportCSV}
                        disabled={!summary}
                        className="bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-[8px] flex items-center gap-2 text-sm font-semibold transition-colors shadow-lg shadow-brand-primary/20"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    {error}
                </div>
            )}

            {!summary ? (
                <div className="glass-panel p-12 text-center text-brand-muted border-dashed">
                    {reportData?.message || "No data available in this date range."}
                </div>
            ) : (
                <>
                    {/* Insights Summary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Period Totals */}
                        <div className="glass-panel p-6 space-y-4">
                            <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wider mb-2">Period Totals</h3>
                            <div className="flex justify-between items-center bg-brand-surface/30 p-3 rounded-lg border border-brand-border/50">
                                <span className="text-brand-muted text-sm flex items-center gap-2"><DollarSign className="w-4 h-4" /> Revenue</span>
                                <span className="text-white font-bold">{fmtC(summary.totalRevenue)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-brand-surface/30 p-3 rounded-lg border border-brand-border/50">
                                <span className="text-brand-muted text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Ad Spend</span>
                                <span className="text-white font-bold">{fmtC(summary.totalAdSpend)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-brand-surface/30 p-3 rounded-lg border border-brand-border/50">
                                <span className="text-brand-muted text-sm flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Orders</span>
                                <span className="text-white font-bold">{summary.totalOrders}</span>
                            </div>
                        </div>

                        {/* Daily Averages */}
                        <div className="glass-panel p-6 space-y-4">
                            <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wider mb-2">Daily Averages</h3>
                            <div className="flex justify-between items-center bg-brand-surface/30 p-3 rounded-lg border border-brand-border/50">
                                <span className="text-brand-muted text-sm">Avg. Revenue / Day</span>
                                <span className="text-white font-bold">{fmtC(summary.avgDailyRevenue)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-brand-surface/30 p-3 rounded-lg border border-brand-border/50">
                                <span className="text-brand-muted text-sm">Avg. Spend / Day</span>
                                <span className="text-white font-bold">{fmtC(summary.avgDailySpend)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-brand-surface/30 p-3 rounded-lg border border-brand-border/50">
                                <span className="text-brand-muted text-sm">Avg. Orders / Day</span>
                                <span className="text-white font-bold">{summary.avgDailyOrders}</span>
                            </div>
                        </div>

                        {/* Blended KPI Outcomes */}
                        <div className="glass-panel p-6 space-y-4 bg-gradient-to-br from-brand-surface/80 to-brand-primary/5 border-brand-primary/20">
                            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider mb-2">Blended KPIs</h3>
                            <div className="flex justify-between items-center p-3">
                                <span className="text-brand-muted text-sm flex items-center gap-2"><Target className="w-4 h-4 text-brand-secondary" /> Blended ROAS</span>
                                <span className="text-2xl text-white font-bold">{summary.blendedRoas ? `${summary.blendedRoas}x` : '—'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3">
                                <span className="text-brand-muted text-sm flex items-center gap-2"><MousePointerClick className="w-4 h-4 text-rose-500" /> Blended CAC</span>
                                <span className="text-2xl text-white font-bold">{fmtC(summary.blendedCac)}</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights Card (Simplified) */}
                    <div className="glass-panel p-6 flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-16 h-16 shrink-0 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20">
                            <FileText className="w-8 h-8 text-brand-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                Automatic Insights
                                {renderTrendIcon(summary.revenueTrend)}
                            </h3>
                            <p className="text-brand-muted text-sm leading-relaxed">
                                Over the selected {summary.periodDays}-day period, your revenue is trending
                                <span className="font-semibold text-white"> {summary.revenueTrend}</span>.
                                Your best performing day was <span className="font-semibold text-white">{fmtDate(summary.peakRevenueDay)}</span>,
                                bringing in <span className="font-semibold text-white">{fmtC(summary.peakRevenue)}</span>.
                            </p>
                        </div>
                    </div>

                    {/* Daily Data Table */}
                    <div className="glass-panel overflow-hidden border-brand-border/50">
                        <div className="px-6 py-5 border-b border-brand-border/50">
                            <h3 className="text-lg font-bold text-white">Daily Breakdown</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-brand-surface/50 text-brand-muted uppercase tracking-wider text-xs border-b border-brand-border/50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold text-right">Revenue</th>
                                        <th className="px-6 py-4 font-semibold text-right">Ad Spend</th>
                                        <th className="px-6 py-4 font-semibold text-right">Orders</th>
                                        <th className="px-6 py-4 font-semibold text-right">ROAS</th>
                                        <th className="px-6 py-4 font-semibold text-right">CAC</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/50">
                                    {dailyMetrics.map((row) => (
                                        <tr key={row.id} className="hover:bg-brand-surface/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{fmtDate(row.date)}</td>
                                            <td className="px-6 py-4 text-right">{fmtC(row.totalRevenue)}</td>
                                            <td className="px-6 py-4 text-right text-amber-400">{fmtC(row.adSpend)}</td>
                                            <td className="px-6 py-4 text-right text-brand-muted">{row.totalOrders}</td>
                                            <td className="px-6 py-4 text-right font-medium text-brand-secondary">
                                                {row.roas != null ? `${row.roas.toFixed(2)}x` : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right text-rose-400">
                                                {fmtC(row.cac)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Comparative Dual-Axis Chart */}
                    <div className="glass-panel p-6 mt-8">
                        <h3 className="text-lg font-bold text-white mb-6">Revenue vs Ad Spend (Comparative)</h3>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyMetrics} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e33" vertical={false} />
                                    <XAxis
                                        dataKey={(row) => new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        stroke="#8b949e"
                                        tick={{ fill: '#8b949e', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    {/* Left Y-axis: Revenue */}
                                    <YAxis
                                        yAxisId="left"
                                        stroke="#8b949e"
                                        tick={{ fill: '#8b949e', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={fmtC}
                                    />
                                    {/* Right Y-axis: Spend */}
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#8b949e"
                                        tick={{ fill: '#8b949e', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={fmtC}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1c1f24', border: '1px solid #30363d', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value) => fmtC(value)}
                                        labelStyle={{ color: '#8b949e', marginBottom: '4px' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        name="Total Revenue"
                                        dataKey="totalRevenue"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#10b981', stroke: '#0d1117', strokeWidth: 2 }}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        name="Ad Spend"
                                        dataKey="adSpend"
                                        stroke="#fbbf24"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#fbbf24', stroke: '#0d1117', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

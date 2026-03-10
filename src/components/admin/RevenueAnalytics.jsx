import { DollarSign, Zap, Sparkles } from 'lucide-react';

const usd = (value) => `$${(value || 0).toLocaleString()}`;

function MiniTrendChart({ data }) {
    if (!data || !data.length) return null;
    const max = Math.max(...data.map(d => d.mrr), 1);

    return (
        <div className="flex items-end gap-1.5 h-16">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div
                        className="w-full bg-brand-primary/80 rounded-t-sm transition-all duration-500 min-h-[2px]"
                        style={{ height: `${Math.max((d.mrr / max) * 100, 3)}%` }}
                        title={`${d.month}: ${usd(d.mrr)}`}
                    />
                    <span className="text-[9px] text-brand-muted font-medium">{d.month}</span>
                </div>
            ))}
        </div>
    );
}

export default function RevenueAnalytics({ revenue }) {
    return (
        <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-brand-border flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Revenue Analytics</h3>
                    <p className="text-sm text-brand-muted">MRR, ARR, tier breakdown, and trend overview.</p>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div>
                        <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mb-1">MRR</p>
                        <p className="text-3xl font-bold text-white">{usd(revenue?.mrr)}</p>
                        <p className="text-xs text-brand-muted mt-1">{revenue?.activeSubs || 0} active subs</p>
                    </div>
                    <div>
                        <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mb-1">ARR</p>
                        <p className="text-3xl font-bold text-brand-primary">{usd(revenue?.arr)}</p>
                        <p className="text-xs text-brand-muted mt-1">Projected annual</p>
                    </div>
                    <div>
                        <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mb-1">Churn Rate</p>
                        <p className="text-3xl font-bold text-white">{revenue?.churnRate || 0}%</p>
                        <p className="text-xs text-brand-muted mt-1">{revenue?.canceledSubs || 0} canceled</p>
                    </div>
                    <div>
                        <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mb-1">6-Month Trend</p>
                        <MiniTrendChart data={revenue?.trend} />
                    </div>
                </div>

                {/* Tier Breakdown Bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-brand-bg border border-brand-border">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-white flex items-center gap-2">
                                <Zap className="w-4 h-4 text-brand-primary" /> Starter Plan
                            </span>
                            <span className="text-sm font-bold text-white">{usd(revenue?.breakdown?.starter?.mrr)}</span>
                        </div>
                        <div className="w-full h-2 bg-brand-surface rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand-primary rounded-full transition-all duration-500"
                                style={{ width: revenue?.mrr > 0 ? `${((revenue?.breakdown?.starter?.mrr || 0) / revenue.mrr) * 100}%` : '0%' }}
                            />
                        </div>
                        <p className="text-xs text-brand-muted mt-2">{revenue?.breakdown?.starter?.count || 0} companies</p>
                    </div>
                    <div className="p-4 rounded-xl bg-brand-bg border border-amber-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" /> Growth Plan
                            </span>
                            <span className="text-sm font-bold text-white">{usd(revenue?.breakdown?.growth?.mrr)}</span>
                        </div>
                        <div className="w-full h-2 bg-brand-surface rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                style={{ width: revenue?.mrr > 0 ? `${((revenue?.breakdown?.growth?.mrr || 0) / revenue.mrr) * 100}%` : '0%' }}
                            />
                        </div>
                        <p className="text-xs text-brand-muted mt-2">{revenue?.breakdown?.growth?.count || 0} companies</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { AlertTriangle, TrendingDown, Clock, PlugZap, ShieldAlert } from 'lucide-react';

export default function InsightsPanel({ companies = [] }) {
    // 1. Churn Risk (Active but Health Score < 40)
    const atRisk = companies.filter(c => c.subscriptionStatus === 'active' && c.healthScore < 40);

    // 2. Stale Syncs (Active, has integrations, but lastSync > 3 days ago)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const staleSyncs = companies.filter(c =>
        c.subscriptionStatus === 'active' &&
        c.integrationCount > 0 &&
        (!c.lastSync || new Date(c.lastSync) < threeDaysAgo)
    );

    // 3. Setup Drop-off (Active but 0 integrations)
    const setupDropoffs = companies.filter(c =>
        c.subscriptionStatus === 'active' &&
        c.integrationCount === 0
    );

    const insights = [
        {
            icon: TrendingDown,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            title: 'High Churn Risk',
            value: atRisk.length,
            desc: 'Active companies with a health score under 40. Requires immediate outreach.',
            actionText: 'View At-Risk',
            items: atRisk.slice(0, 3)
        },
        {
            icon: PlugZap,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            title: 'Setup Drop-off',
            value: setupDropoffs.length,
            desc: 'Active companies with zero connected data sources.',
            actionText: 'Send Setup Reminder',
            items: setupDropoffs.slice(0, 3)
        },
        {
            icon: Clock,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            title: 'Stale Sync Pipelines',
            value: staleSyncs.length,
            desc: 'Companies whose data has not synced in over 72 hours.',
            actionText: 'Check Pipelines',
            items: staleSyncs.slice(0, 3)
        }
    ];

    if (insights.every(i => i.value === 0)) return null;

    return (
        <div className="glass-panel overflow-hidden border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)]">
            <div className="p-6 border-b border-brand-border flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                    <ShieldAlert className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">System Insights & Anomalies</h3>
                    <p className="text-sm text-brand-muted">AI-driven alerts for portfolio management.</p>
                </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.map((insight, idx) => (
                    <div key={idx} className={`p-5 rounded-xl bg-brand-bg/50 border ${insight.border} flex flex-col`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg ${insight.bg}`}>
                                <insight.icon className={`w-5 h-5 ${insight.color}`} />
                            </div>
                            <span className={`text-2xl font-bold ${insight.value > 0 ? insight.color : 'text-brand-muted'}`}>
                                {insight.value}
                            </span>
                        </div>
                        <h4 className="text-white font-bold mb-1">{insight.title}</h4>
                        <p className="text-xs text-brand-muted mb-4 flex-1 leading-relaxed">
                            {insight.desc}
                        </p>

                        {insight.value > 0 ? (
                            <div className="space-y-2 mb-4">
                                {insight.items.map(comp => (
                                    <div key={comp.id} className="text-xs flex items-center justify-between bg-brand-surface/50 px-3 py-2 rounded border border-brand-border/30">
                                        <span className="text-white font-medium truncate max-w-[120px]">{comp.name}</span>
                                        <span className="text-brand-muted">ID: {comp.id.substring(0, 5)}...</span>
                                    </div>
                                ))}
                                {insight.value > 3 && (
                                    <p className="text-[10px] text-brand-muted text-center pt-1">+{insight.value - 3} more</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center min-h-[60px] mb-4 border border-dashed border-brand-border/50 rounded bg-brand-surface/20">
                                <span className="text-xs text-brand-muted">All clear</span>
                            </div>
                        )}

                        <button
                            disabled={insight.value === 0}
                            className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${insight.value > 0
                                    ? 'bg-brand-surface border border-brand-border hover:bg-brand-surface/80 text-white'
                                    : 'bg-brand-bg text-brand-muted/30 cursor-not-allowed'
                                }`}
                        >
                            {insight.actionText}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

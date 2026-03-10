import { Activity, Trash2, Wifi, WifiOff, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const usd = (value) => `$${(value || 0).toLocaleString()}`;

function HealthDot({ score }) {
    let color = 'bg-red-500';
    if (score >= 70) color = 'bg-emerald-500';
    else if (score >= 40) color = 'bg-amber-500';

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`} />
            <span className="text-xs text-brand-muted font-medium">{score}</span>
        </div>
    );
}

export default function HealthTable({ companies, handleImpersonate, impersonatingId, setDeletingCompany }) {
    return (
        <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-brand-border flex items-center gap-3">
                <div className="p-2 bg-brand-surface rounded-lg"><Activity className="w-4 h-4 text-brand-primary" /></div>
                <div>
                    <h3 className="text-lg font-bold text-white">Platform Tenants & Health</h3>
                    <p className="text-sm text-brand-muted">All companies ranked by MRR with health indicators.</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-brand-muted">
                    <thead className="text-xs uppercase bg-brand-surface/30 border-b border-brand-border text-brand-muted/70">
                        <tr>
                            <th className="px-5 py-4 font-semibold tracking-wider">Health</th>
                            <th className="px-5 py-4 font-semibold tracking-wider">Company</th>
                            <th className="px-5 py-4 font-semibold tracking-wider">Tier / Status</th>
                            <th className="px-5 py-4 font-semibold tracking-wider">MRR</th>
                            <th className="px-5 py-4 font-semibold tracking-wider">Users</th>
                            <th className="px-5 py-4 font-semibold tracking-wider">Integrations</th>
                            <th className="px-5 py-4 font-semibold tracking-wider">Last Sync</th>
                            <th className="px-5 py-4 font-semibold tracking-wider">Last Login</th>
                            <th className="px-5 py-4 font-semibold tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/50">
                        {companies.length > 0 ? companies.map((comp) => (
                            <tr key={comp.id} className="hover:bg-brand-surface/20 transition-colors">
                                <td className="px-5 py-4"><HealthDot score={comp.healthScore} /></td>
                                <td className="px-5 py-4 font-medium text-white">{comp.name}</td>
                                <td className="px-5 py-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${comp.subscriptionTier === 'GROWTH' ? 'bg-amber-500/20 text-amber-500' : comp.subscriptionTier === 'STARTER' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-surface text-brand-muted'}`}>
                                            {comp.subscriptionTier}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wide text-brand-muted/70">{comp.subscriptionStatus}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 font-medium text-white">{usd(comp.mrr)}</td>
                                <td className="px-5 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-surface text-brand-muted">{comp.userCount}</span>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-1.5">
                                        {comp.integrationCount > 0 ? (
                                            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                            <WifiOff className="w-3.5 h-3.5 text-brand-muted/50" />
                                        )}
                                        <span className="text-xs">{comp.integrationCount} / 4</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-xs">
                                    {comp.lastSync ? (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(comp.lastSync), { addSuffix: true })}
                                        </span>
                                    ) : (
                                        <span className="text-brand-muted/50">Never</span>
                                    )}
                                </td>
                                <td className="px-5 py-4 text-xs">
                                    {comp.lastLogin ? (
                                        <span>{formatDistanceToNow(new Date(comp.lastLogin), { addSuffix: true })}</span>
                                    ) : (
                                        <span className="text-brand-muted/50">Never</span>
                                    )}
                                </td>
                                <td className="px-5 py-4 text-right">
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
                            <tr><td colSpan="9" className="px-6 py-8 text-center text-brand-muted">No companies found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

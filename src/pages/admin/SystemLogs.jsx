import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Activity, Globe } from 'lucide-react';
import { format } from 'date-fns';

export default function SystemLogs() {
    const { token } = useAuth();
    const headers = { 'Authorization': `Bearer ${token}` };

    const { data: pulse = [], isLoading, isError } = useQuery({
        queryKey: ['adminPulse'],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pulse`, { headers });
            if (!res.ok) throw new Error('Failed to fetch global pulse.');
            return res.json();
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">System Audit Logs</h1>
                <p className="text-brand-muted text-sm">Real-time cross-tenant activity log from all companies and users.</p>
            </div>

            <div className="glass-panel overflow-hidden flex flex-col h-[calc(100vh-[var(--topbar-height)]-10rem)] min-h-[500px]">
                <div className="p-6 border-b border-brand-border flex items-center gap-3 flex-shrink-0">
                    <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                        <Globe className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Global Audit Pulse</h3>
                        <p className="text-sm text-brand-muted">Displaying the latest 50 recorded actions.</p>
                    </div>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="text-center py-12 flex flex-col items-center justify-center text-brand-muted gap-4">
                            <Activity className="w-8 h-8 opacity-50 animate-pulse" />
                            Loading audit logs...
                        </div>
                    ) : isError ? (
                        <div className="text-center py-12 text-red-400 border border-dashed border-red-500/20 rounded-xl bg-red-500/5">
                            Failed to load system logs.
                        </div>
                    ) : pulse.length === 0 ? (
                        <p className="text-brand-muted text-center py-12 border border-dashed border-brand-border rounded-xl">
                            No recent activity found on the platform.
                        </p>
                    ) : (
                        <div className="space-y-4 pr-2">
                            {pulse.map((log) => (
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
                                        <div className="mt-2 text-xs font-mono text-brand-muted/70 bg-brand-bg p-3 rounded border border-brand-border/50 overflow-x-auto">
                                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

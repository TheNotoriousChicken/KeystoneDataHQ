import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, AlertTriangle, Bug, TerminalSquare, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ErrorLogs() {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('kd_token');
    const [filter, setFilter] = useState('UNRESOLVED');

    const { data: logs, isLoading, isError } = useQuery({
        queryKey: ['superAdminErrorLogs'],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/error-logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch error logs');
            return res.json();
        },
        refetchInterval: 10000 // auto-refresh every 10s
    });

    const handleResolve = async (id) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/admin/error-logs/${id}/resolve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            queryClient.invalidateQueries(['superAdminErrorLogs']);
        } catch (err) {
            console.error(err);
        }
    };

    const displayLogs = logs?.filter(log => {
        if (filter === 'UNRESOLVED') return !log.resolved;
        if (filter === 'RESOLVED') return log.resolved;
        return true;
    }) || [];

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Bug className="w-6 h-6 text-red-400" />
                        Mini-Sentry (Error Catching)
                    </h1>
                    <p className="text-brand-muted text-sm border-l-2 border-red-500/50 pl-3 py-0.5">
                        Global real-time feed of unhandled 500-level backend exceptions.
                    </p>
                </div>
                <div className="flex bg-brand-surface p-1 rounded-lg border border-brand-border">
                    <button 
                        onClick={() => setFilter('UNRESOLVED')}
                        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${filter === 'UNRESOLVED' ? 'bg-red-500/20 text-red-400' : 'text-brand-muted hover:text-white'}`}
                    >
                        Unresolved
                    </button>
                    <button 
                        onClick={() => setFilter('RESOLVED')}
                        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${filter === 'RESOLVED' ? 'bg-brand-primary/20 text-brand-primary' : 'text-brand-muted hover:text-white'}`}
                    >
                        Resolved
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="p-12 text-center text-brand-muted border-2 border-dashed border-brand-border rounded-xl">
                        Loading crash reports...
                    </div>
                ) : isError ? (
                    <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5" /> Failed to load Mini-Sentry data.
                    </div>
                ) : displayLogs.length === 0 ? (
                    <div className="p-12 text-center text-brand-muted border border-brand-border bg-brand-bg rounded-xl flex flex-col items-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mb-4" />
                        <p className="text-lg font-medium text-white">All systems operational</p>
                        <p className="text-sm">No {filter.toLowerCase()} errors found in the logs.</p>
                    </div>
                ) : (
                    displayLogs.map(log => (
                        <div key={log.id} className={`p-6 rounded-xl border flex flex-col md:flex-row gap-6 ${log.resolved ? 'bg-brand-surface/30 border-brand-border opacity-70' : 'bg-brand-bg relative overflow-hidden border-brand-border hover:border-red-500/50 transition-colors'}`}>
                            {!log.resolved && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            )}
                            
                            <div className="flex-1 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${log.resolved ? 'bg-brand-surface text-brand-muted' : 'bg-red-500/20 text-red-500'}`}>
                                                {log.method} {log.path}
                                            </span>
                                            <span className="text-xs text-brand-muted font-medium flex items-center gap-1">
                                                <TerminalSquare className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white break-all">{log.message}</h3>
                                    </div>
                                    {!log.resolved && (
                                        <button 
                                            onClick={() => handleResolve(log.id)}
                                            className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded transition-colors whitespace-nowrap"
                                        >
                                            Mark Resolved
                                        </button>
                                    )}
                                </div>
                                
                                {log.stack && (
                                    <div className="bg-[#0f1115] border border-brand-border/50 rounded-lg p-4 custom-scrollbar overflow-x-auto">
                                        <pre className="text-xs text-rose-300/80 font-mono whitespace-pre-wrap">{log.stack}</pre>
                                    </div>
                                )}

                                {(log.userId || log.companyId) && (
                                    <div className="flex gap-4 text-xs font-mono text-brand-muted">
                                        {log.companyId && <span>Tenant: <span className="text-indigo-400">{log.companyId}</span></span>}
                                        {log.userId && <span>User: <span className="text-blue-400">{log.userId}</span></span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

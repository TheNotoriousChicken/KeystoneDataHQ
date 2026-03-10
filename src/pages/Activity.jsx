import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Activity as ActivityIcon, User, Clock, Monitor, Key, LogIn, Mail, CreditCard, Shield } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { formatDistanceToNow } from 'date-fns';

// Helper to map actions to pleasant text and icons
const getActionDisplay = (action) => {
    switch (action) {
        case 'USER_REGISTERED':
            return { text: 'Account created', icon: User, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
        case 'USER_LOGIN':
            return { text: 'Logged in', icon: LogIn, color: 'text-blue-400', bg: 'bg-blue-400/10' };
        case 'PROFILE_UPDATED':
            return { text: 'Updated profile', icon: User, color: 'text-purple-400', bg: 'bg-purple-400/10' };
        case 'PASSWORD_RESET_REQUESTED':
            return { text: 'Requested password reset', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10' };
        case 'PASSWORD_RESET_COMPLETED':
            return { text: 'Reset password', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
        case 'PASSWORD_CHANGED':
            return { text: 'Changed password', icon: Key, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
        case 'EMAIL_VERIFIED':
            return { text: 'Verified email', icon: Mail, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
        case 'TEAM_INVITE_SENT':
            return { text: 'Sent team invite', icon: Mail, color: 'text-blue-400', bg: 'bg-blue-400/10' };
        case 'CHECKOUT_INITIALIZED':
            return { text: 'Started billing checkout', icon: CreditCard, color: 'text-brand-primary', bg: 'bg-brand-primary/10' };
        default:
            return { text: action, icon: ActivityIcon, color: 'text-brand-muted', bg: 'bg-brand-surface' };
    }
};

export default function Activity() {
    const { token } = useAuth();

    const { data: activities, isLoading, error } = useQuery({
        queryKey: ['activity'],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/activity`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load activity log.');
            return data.activity;
        },
        enabled: !!token,
    });

    if (isLoading) {
        return (
            <div className="max-w-4xl space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Activity Log</h2>
                    <p className="text-brand-muted mt-1">Audit trail of team actions across your company.</p>
                </div>
                <div className="glass-panel p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4 items-center">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="w-1/3 h-4" />
                                <Skeleton className="w-1/4 h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl max-w-4xl">
                <p className="text-rose-400 font-medium">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Activity Log</h2>
                <p className="text-brand-muted mt-1">Audit trail of team actions across your company.</p>
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="border-b border-white/5 bg-brand-surface/30 px-6 py-4 flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <ActivityIcon className="w-4 h-4 text-brand-primary" />
                        Recent Activity
                    </h3>
                    <span className="text-xs text-brand-muted font-medium bg-brand-surface px-2.5 py-1 rounded-md border border-brand-border">
                        Last 50 events
                    </span>
                </div>

                <div className="divide-y divide-white/5">
                    {activities.length === 0 ? (
                        <div className="p-12 text-center text-brand-muted">
                            <ActivityIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No activity recorded yet.</p>
                        </div>
                    ) : (
                        activities.map((log) => {
                            const display = getActionDisplay(log.action);
                            const Icon = display.icon;

                            return (
                                <div key={log.id} className="p-4 hover:bg-brand-surface/30 transition-colors flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${display.bg} ${display.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white">
                                            {log.user ? (
                                                <span className="font-semibold">{log.user.firstName} {log.user.lastName} </span>
                                            ) : (
                                                <span className="font-semibold text-brand-primary">System </span>
                                            )}
                                            <span className="text-brand-muted font-normal">{display.text}</span>
                                        </p>

                                        {log.details && (
                                            <p className="text-sm text-brand-muted mt-0.5 truncate border-l-2 border-brand-border pl-2 py-0.5 ml-0.5">
                                                {log.details}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 mt-1.5 text-xs text-brand-muted/70">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </span>
                                            {log.ipAddress && (
                                                <span className="flex items-center gap-1.5">
                                                    <Monitor className="w-3.5 h-3.5" />
                                                    {log.ipAddress}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Info, AlertTriangle, XCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const getIconForType = (type) => {
    switch (type) {
        case 'SUCCESS': return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
        case 'WARNING': return { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' };
        case 'ERROR': return { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' };
        case 'INFO':
        default: return { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10' };
    }
};

export default function Notifications() {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState('');

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications?limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setNotifications(data.notifications);
        } catch (err) {
            setError('Failed to load notifications.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchNotifications();
    }, [token]);

    const handleMarkAsRead = async (id, e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Failed to mark read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl max-w-4xl space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Notifications</h2>
                    <p className="text-brand-muted mt-1">Stay updated on account activity and events.</p>
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
                <p className="text-rose-400 font-medium">{error}</p>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Notifications</h2>
                    <p className="text-brand-muted mt-1">Stay updated on account activity and events.</p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="bg-brand-surface hover:bg-brand-surface/80 text-white font-medium px-4 py-2 rounded-lg transition-colors border border-brand-border text-sm flex items-center gap-2"
                    >
                        <Check className="w-4 h-4 text-brand-primary" />
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="border-b border-white/5 bg-brand-surface/30 px-6 py-4 flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-brand-primary" />
                        Inbox
                    </h3>
                    <span className="text-xs text-brand-secondary font-medium bg-brand-secondary/10 px-2.5 py-1 rounded-md border border-brand-secondary/20">
                        {unreadCount} Unread
                    </span>
                </div>

                <div className="divide-y divide-white/5">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-brand-muted">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>You have no notifications yet.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const { icon: Icon, color, bg } = getIconForType(notification.type);

                            const ContentWrapper = notification.link && !notification.read
                                ? ({ children }) => (
                                    <Link
                                        to={notification.link}
                                        onClick={(e) => handleMarkAsRead(notification.id, undefined)}
                                        className={`block p-4 hover:bg-brand-surface/30 transition-colors relative ${!notification.read ? 'bg-brand-primary/5' : ''}`}
                                    >
                                        {children}
                                    </Link>
                                )
                                : ({ children }) => (
                                    <div className={`p-4 hover:bg-brand-surface/30 transition-colors relative ${!notification.read ? 'bg-brand-primary/5' : ''}`}>
                                        {children}
                                    </div>
                                );

                            return (
                                <ContentWrapper key={notification.id}>
                                    {!notification.read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary"></div>
                                    )}
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bg} ${color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm ${!notification.read ? 'text-white font-medium' : 'text-brand-muted'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="flex items-center gap-1.5 text-xs text-brand-muted/70 flex-shrink-0">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>

                                            <p className="text-sm text-brand-muted mt-1">
                                                {notification.message}
                                            </p>

                                            <div className="mt-3 flex gap-3">
                                                {!notification.read && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                        className="text-xs font-semibold text-brand-primary hover:text-white transition-colors flex items-center gap-1 bg-brand-primary/10 px-2 py-1 rounded border border-brand-primary/20 hover:bg-brand-primary/20"
                                                    >
                                                        <Check className="w-3 h-3" /> Mark as read
                                                    </button>
                                                )}
                                                {notification.link && notification.read && (
                                                    <Link to={notification.link} className="text-xs font-medium text-brand-muted hover:text-white transition-colors underline underline-offset-2">
                                                        View details
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </ContentWrapper>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Info, AlertTriangle, XCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const getIconForType = (type) => {
    switch (type) {
        case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
        case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
        case 'ERROR': return <XCircle className="w-4 h-4 text-rose-400" />;
        case 'INFO':
        default: return <Info className="w-4 h-4 text-blue-400" />;
    }
};

export default function NotificationDropdown() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/notifications?limit=5', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        if (token) fetchNotifications();
    }, [token]);

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id, link) => {
        try {
            await fetch(`http://localhost:4000/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Optimistic UI update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            setIsOpen(false);
            if (link) navigate(link);

        } catch (err) {
            console.error('Failed to mark read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await fetch('http://localhost:4000/api/notifications/read-all', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-brand-surface transition-colors flex items-center justify-center text-brand-muted hover:text-white"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-primary rounded-full border-2 border-brand-bg"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-brand-bg border border-brand-border rounded-xl shadow-2xl z-50 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-brand-surface/50">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-brand-primary hover:text-brand-primary/80 flex items-center gap-1 transition-colors"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-brand-border/50">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-brand-muted">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">You have no notifications.</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleMarkAsRead(notification.id, notification.link)}
                                    className={`p-4 hover:bg-brand-surface cursor-pointer transition-colors relative ${!notification.read ? 'bg-brand-primary/5' : ''}`}
                                >
                                    {!notification.read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary"></div>
                                    )}
                                    <div className="flex gap-3">
                                        <div className="mt-0.5">
                                            {getIconForType(notification.type)}
                                        </div>
                                        <div>
                                            <p className={`text-sm ${!notification.read ? 'text-white font-medium' : 'text-brand-muted'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-brand-muted mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-brand-muted/70 mt-2 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-2 border-t border-brand-border bg-brand-surface/30">
                        <button
                            onClick={() => { setIsOpen(false); navigate('/dashboard/notifications'); }}
                            className="w-full text-center text-sm text-brand-muted hover:text-white py-2 transition-colors rounded-lg hover:bg-brand-surface"
                        >
                            View all notifications →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

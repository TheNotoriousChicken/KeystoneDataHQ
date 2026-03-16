import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Megaphone } from 'lucide-react';

export default function Broadcasts() {
    const { token } = useAuth();
    const [error, setError] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);

    const headers = { 'Authorization': `Bearer ${token}` };
    const API = import.meta.env.VITE_API_URL;

    const handleCreateBroadcast = async (e) => {
        e.preventDefault();
        setIsPublishing(true);
        const fd = new FormData(e.target);
        const message = fd.get('message');
        if (!message) return;
        try {
            setError('');
            const res = await fetch(`${API}/api/admin/broadcast`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, type: fd.get('type') })
            });
            if (!res.ok) throw new Error('Failed to publish broadcast.');
            window.location.reload(); // Quick way to show the banner immediately
        } catch (err) {
            setError(err.message);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Global Broadcasts</h1>
                <p className="text-brand-muted text-sm">Send banner alerts to all active users on the platform. Publishing a new broadcast automatically replaces the previous one.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-brand-border flex items-center gap-3">
                    <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                        <Megaphone className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Publish New Broadcast</h3>
                        <p className="text-sm text-brand-muted">Top-level warning banners.</p>
                    </div>
                </div>
                <div className="p-6">
                    <form onSubmit={handleCreateBroadcast} className="space-y-4 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-brand-muted mb-2">Message Content</label>
                            <textarea
                                name="message"
                                placeholder="e.g. Scheduled maintenance in 1 hour. Some features may be temporarily degraded."
                                rows={4}
                                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary/50 resize-none"
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-brand-muted mb-2">Alert Type</label>
                                <select name="type" className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 appearance-none">
                                    <option value="INFO">Informational (Blue)</option>
                                    <option value="WARNING">Warning (Yellow)</option>
                                    <option value="CRITICAL">Critical (Red)</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button type="submit" disabled={isPublishing} className="py-3 px-8 bg-red-600/90 text-white text-sm font-bold rounded-lg hover:bg-red-500 transition-colors whitespace-nowrap disabled:opacity-50">
                                    {isPublishing ? 'Publishing...' : 'Publish'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Key } from 'lucide-react';

export default function FeatureFlags() {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const [togglingFlag, setTogglingFlag] = useState(null);
    const [error, setError] = useState('');

    const headers = { 'Authorization': `Bearer ${token}` };
    const API = import.meta.env.VITE_API_URL;

    const { data: flags = [], isLoading } = useQuery({
        queryKey: ['adminFlags'],
        queryFn: async () => {
            const res = await fetch(`${API}/api/admin/flags`, { headers });
            if (!res.ok) throw new Error('Failed to fetch flags');
            return res.json();
        }
    });

    const handleToggleFlag = async (key, currentStatus, description) => {
        try {
            setTogglingFlag(key);
            setError('');
            const res = await fetch(`${API}/api/admin/flags`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, isEnabled: !currentStatus, description })
            });
            if (!res.ok) throw new Error('Failed to update feature flag.');
            queryClient.invalidateQueries({ queryKey: ['adminFlags'] });
        } catch (err) {
            setError(err.message);
        } finally {
            setTogglingFlag(null);
        }
    };

    const handleCreateFlag = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const key = fd.get('key');
        if (!key) return;
        try {
            setError('');
            const res = await fetch(`${API}/api/admin/flags`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, isEnabled: false, description: fd.get('description') })
            });
            if (!res.ok) throw new Error('Failed to create flag.');
            queryClient.invalidateQueries({ queryKey: ['adminFlags'] });
            e.target.reset();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Feature Flags</h1>
                <p className="text-brand-muted text-sm">Toggle global features on and off safely without deploying code.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-brand-border flex items-center gap-3">
                    <div className="p-2 bg-brand-surface rounded-md border border-brand-border">
                        <Key className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">System Flags</h3>
                        <p className="text-sm text-brand-muted">Manage active toggles.</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleCreateFlag} className="flex flex-col sm:flex-row gap-3">
                        <input type="text" name="key" placeholder="e.g. enable_beta_reports" className="flex-1 bg-brand-bg border border-brand-border rounded-md px-4 py-2 text-sm text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary" required />
                        <input type="text" name="description" placeholder="Short description..." className="flex-1 bg-brand-bg border border-brand-border rounded-md px-4 py-2 text-sm text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary" />
                        <button type="submit" className="px-6 py-2 bg-brand-surface border border-brand-border text-white text-sm font-bold rounded-md hover:border-brand-primary hover:text-white transition-colors">
                            Add Flag
                        </button>
                    </form>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="text-center py-8 flex items-center justify-center text-brand-muted gap-2">
                                <div className="w-4 h-4 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                                Loading flags...
                            </div>
                        ) : flags.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-brand-border rounded-md">
                                <p className="text-sm text-brand-muted">No feature flags created yet.</p>
                            </div>
                        ) : (
                            flags.map(flag => (
                                <div key={flag.id} className="p-4 rounded-md bg-brand-bg border border-brand-border flex items-center justify-between hover:border-brand-primary/30 transition-colors">
                                    <div>
                                        <p className="font-mono text-sm font-medium text-brand-primary mb-1 inline-flex items-center gap-2">
                                            {flag.key}
                                        </p>
                                        {flag.description && <p className="text-xs text-brand-muted">{flag.description}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleToggleFlag(flag.key, flag.isEnabled, flag.description)}
                                        disabled={togglingFlag === flag.key}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${flag.isEnabled ? 'bg-emerald-500' : 'bg-brand-surface'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${flag.isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

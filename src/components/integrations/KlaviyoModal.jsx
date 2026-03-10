import { useState } from 'react';
import { Mail, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function KlaviyoModal({ isOpen, onClose }) {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const API = import.meta.env.VITE_API_URL;

    const [klaviyoApiKey, setKlaviyoApiKey] = useState('');
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const klaviyoMutation = useMutation({
        mutationFn: async ({ klaviyoApiKey }) => {
            const res = await fetch(`${API}/api/integrations/klaviyo/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ apiKey: klaviyoApiKey })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to connect to Klaviyo.');
            return data;
        },
        onSuccess: (data) => {
            setSuccessMsg(data.message);
            queryClient.invalidateQueries({ queryKey: ['integrationStatus'] });
            setTimeout(() => {
                onClose();
                setSuccessMsg(null);
                setKlaviyoApiKey('');
            }, 2000);
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const handleConnectKlaviyo = (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        klaviyoMutation.mutate({ klaviyoApiKey });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md p-6 relative border-brand-border shadow-2xl animate-fade-in-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-brand-muted hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-brand-border" style={{ backgroundColor: '#20C6B615' }}>
                        <Mail className="w-5 h-5 text-[#20C6B6]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Connect Klaviyo</h3>
                        <p className="text-sm text-brand-muted">Enter your Private API Key</p>
                    </div>
                </div>

                <form onSubmit={handleConnectKlaviyo} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-muted mb-1.5">Private API Key</label>
                        <input
                            type="password"
                            value={klaviyoApiKey}
                            onChange={(e) => setKlaviyoApiKey(e.target.value)}
                            placeholder="pk_..."
                            required
                            className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                        />
                        <p className="text-xs text-brand-muted/70 mt-1">Requires read access to metrics, lists, and profiles.</p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
                    )}
                    {successMsg && (
                        <div className="p-3 rounded-lg bg-brand-secondary/10 border border-brand-secondary/20 text-sm text-brand-secondary flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />{successMsg}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={klaviyoMutation.isPending}
                            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                        >
                            {klaviyoMutation.isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Connecting...
                                </>
                            ) : 'Connect Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

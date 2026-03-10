import { useState } from 'react';
import { LineChart, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function Ga4Modal({ isOpen, onClose }) {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const API = import.meta.env.VITE_API_URL;

    const [ga4PropertyId, setGa4PropertyId] = useState('');
    const [ga4Credentials, setGa4Credentials] = useState('');
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const ga4Mutation = useMutation({
        mutationFn: async ({ ga4PropertyId, ga4Credentials }) => {
            const res = await fetch(`${API}/api/integrations/ga4/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ propertyId: ga4PropertyId, credentialsJson: ga4Credentials })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to connect to GA4.');
            return data;
        },
        onSuccess: (data) => {
            setSuccessMsg(data.message);
            queryClient.invalidateQueries({ queryKey: ['integrationStatus'] });
            setTimeout(() => {
                onClose();
                setSuccessMsg(null);
                setGa4PropertyId('');
                setGa4Credentials('');
            }, 2000);
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const handleConnectGa4 = (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        ga4Mutation.mutate({ ga4PropertyId, ga4Credentials });
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
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-brand-border" style={{ backgroundColor: '#F9AB0015' }}>
                        <LineChart className="w-5 h-5 text-[#F9AB00]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Connect GA4</h3>
                        <p className="text-sm text-brand-muted">Enter your Property ID and Service Account JSON</p>
                    </div>
                </div>

                <form onSubmit={handleConnectGa4} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-muted mb-1.5">Property ID</label>
                        <input
                            type="text"
                            value={ga4PropertyId}
                            onChange={(e) => setGa4PropertyId(e.target.value)}
                            placeholder="e.g. 123456789"
                            required
                            className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-muted mb-1.5">Service Account JSON</label>
                        <textarea
                            value={ga4Credentials}
                            onChange={(e) => setGa4Credentials(e.target.value)}
                            placeholder='{"type": "service_account", "project_id": "...", ...}'
                            required
                            rows="4"
                            className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 font-mono text-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                        ></textarea>
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
                            disabled={ga4Mutation.isPending}
                            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                        >
                            {ga4Mutation.isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Connecting...
                                </>
                            ) : 'Verify & Connect'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

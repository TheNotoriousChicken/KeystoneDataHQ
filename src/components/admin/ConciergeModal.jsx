import { useState } from 'react';
import { Sparkles, X, Activity, UserPlus } from 'lucide-react';

export default function ConciergeModal({ onClose, refetch }) {
    const [formData, setFormData] = useState({
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        tier: 'STARTER',
        trialDays: 14
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess('');

        try {
            const res = await fetch(`/api/admin/concierge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to provision workspace.');

            setSuccess(`Workspace created! An email has been sent to ${formData.email}.`);
            await refetch();
            
            // Close after 3 seconds on success
            setTimeout(onClose, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-background/80 backdrop-blur-sm p-4">
            <div className="bg-brand-surface border border-brand-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="p-6 border-b border-brand-border flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-400" /> Concierge Setup
                        </h3>
                        <p className="text-sm text-brand-muted mt-1">Generate a Magic Workspace Link for a client.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-brand-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium">
                                {success}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Workspace Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Acme Corp"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full bg-brand-background border border-brand-border text-white text-sm rounded-lg px-3 py-2.5 focus:border-brand-primary focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Jane"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-brand-background border border-brand-border text-white text-sm rounded-lg px-3 py-2.5 focus:border-brand-primary focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-brand-background border border-brand-border text-white text-sm rounded-lg px-3 py-2.5 focus:border-brand-primary focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="jane@acme.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-brand-background border border-brand-border text-white text-sm rounded-lg px-3 py-2.5 focus:border-brand-primary focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Starting Tier</label>
                                    <select
                                        value={formData.tier}
                                        onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                                        className="w-full bg-brand-background border border-brand-border text-white text-sm rounded-lg px-3 py-2.5 focus:border-brand-primary focus:outline-none transition-colors"
                                    >
                                        <option value="STARTER">Starter</option>
                                        <option value="GROWTH">Growth</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Trial Days</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.trialDays}
                                        onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                                        className="w-full bg-brand-background border border-brand-border text-white text-sm rounded-lg px-3 py-2.5 focus:border-brand-primary focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-brand-border flex justify-end gap-3 bg-brand-surface/50">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-brand-muted hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="flex items-center gap-2 px-5 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading && <Activity className="w-4 h-4 animate-spin" />}
                            {success ? <UserPlus className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                            {success ? 'Created!' : 'Provision & Email'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

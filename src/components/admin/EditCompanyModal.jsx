import { useState } from 'react';
import { ShieldAlert, Activity, Check, X, Building } from 'lucide-react';

export default function EditCompanyModal({ company, onClose, refetch }) {
    const [isSuspended, setIsSuspended] = useState(company.isSuspended || false);
    const [tier, setTier] = useState(company.subscriptionTier || 'STARTER');
    const [status, setStatus] = useState(company.subscriptionStatus || 'active');
    const [trialDays, setTrialDays] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            // Update Suspension
            if (isSuspended !== company.isSuspended) {
                const res = await fetch(`/api/admin/companies/${company.id}/suspend`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('kd_token')}`
                    },
                    body: JSON.stringify({ isSuspended })
                });
                if (!res.ok) throw new Error('Failed to update suspension status.');
            }

            // Update Tier/Trial
            if (tier !== company.subscriptionTier || status !== company.subscriptionStatus || trialDays) {
                const payload = { subscriptionTier: tier, subscriptionStatus: status };
                if (trialDays && parseInt(trialDays) > 0) payload.trialDays = parseInt(trialDays);

                const res = await fetch(`/api/admin/companies/${company.id}/tier`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('kd_token')}`
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Failed to update tier information.');
            }

            await refetch();
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred while updating the company.');
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
                            <Building className="w-5 h-5 text-brand-primary" /> Edit {company.name}
                        </h3>
                        <p className="text-sm text-brand-muted mt-1">Manage billing, access, and trials.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-brand-muted" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Kill Switch */}
                    <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 text-red-400" /> Kill Switch (Suspend)
                            </h4>
                            <p className="text-xs text-brand-muted mt-1">Instantly drops their JWT sessions.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isSuspended}
                                onChange={(e) => setIsSuspended(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-brand-background rounded-full peer peer-checked:bg-red-500 peer-focus:outline-none transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Plan Tier</label>
                            <select
                                value={tier}
                                onChange={(e) => setTier(e.target.value)}
                                className="w-full bg-brand-background border border-brand-border text-white text-sm rounded-lg px-3 py-2.5 focus:border-brand-primary focus:outline-none transition-colors"
                            >
                                <option value="NONE">None</option>
                                <option value="STARTER">Starter ($500/m)</option>
                                <option value="GROWTH">Growth ($1500/m)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-brand-background border border-brand-border text-white text-sm rounded-lg px-3 py-2.5 focus:border-brand-primary focus:outline-none transition-colors"
                            >
                                <option value="active">Active</option>
                                <option value="trialing">Trialing</option>
                                <option value="past_due">Past Due</option>
                                <option value="canceled">Canceled</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Extend Trial (Days)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="e.g. 14"
                            value={trialDays}
                            onChange={(e) => setTrialDays(e.target.value)}
                            className="w-full bg-brand-background border border-brand-border text-white text-sm rounded-lg px-3 py-2.5 focus:border-brand-primary focus:outline-none transition-colors"
                        />
                        <p className="text-[10px] text-brand-muted">Leave blank to keep current trial end date.</p>
                    </div>
                </div>

                <div className="p-6 border-t border-brand-border flex justify-end gap-3 bg-brand-surface/50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-brand-muted hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading && <Activity className="w-4 h-4 animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

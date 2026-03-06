import { useState, useEffect } from 'react';
import { CheckCircle2, ExternalLink, CreditCard, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const TIER_INFO = {
    NONE: { label: 'No Plan', price: '$0', color: 'brand-muted' },
    STARTER: { label: 'Starter Plan', price: '$500', color: 'brand-primary' },
    GROWTH: { label: 'Growth Plan', price: '$1,500', color: 'brand-primary' },
};

export default function Billing() {
    const { token } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBilling = async () => {
            try {
                const res = await fetch('http://localhost:4000/api/billing/status', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok) setSubscription(data.subscription);
            } catch (err) {
                console.error('Failed to fetch billing info:', err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchBilling();
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-3 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
            </div>
        );
    }

    const tier = subscription?.subscriptionTier || 'NONE';
    const status = subscription?.subscriptionStatus || 'inactive';
    const info = TIER_INFO[tier] || TIER_INFO.NONE;
    const isActive = status === 'active';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Subscription & Billing</h2>
                <p className="text-brand-muted mt-2">Manage your plan and subscription status.</p>
            </div>

            {/* Current Plan Card */}
            <div className={`glass-panel p-8 relative overflow-hidden ${isActive ? 'border-brand-primary/50' : 'border-amber-500/50'}`}>
                <div className={`absolute top-0 right-0 w-64 h-64 ${isActive ? 'bg-brand-primary/10' : 'bg-amber-500/10'} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{info.label}</h3>
                            {isActive ? (
                                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-secondary/10 border border-brand-secondary/20 text-xs font-medium text-brand-secondary">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Active
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {status === 'inactive' ? 'No Active Subscription' : status}
                                </span>
                            )}
                        </div>
                        <p className="text-brand-muted text-sm max-w-md">
                            {isActive
                                ? `You are on the fully-managed ${info.label}. Your subscription is active and billing is handled by Lemon Squeezy.`
                                : "You don't have an active subscription yet. Choose a plan to get started with Keystone Data HQ."}
                        </p>

                        {subscription?.lemonSqueezySubscriptionId && (
                            <div className="flex items-center gap-2 mt-4">
                                <CreditCard className="w-5 h-5 text-brand-muted" />
                                <span className="text-sm text-brand-muted">
                                    Subscription ID: <span className="text-white font-medium">{subscription.lemonSqueezySubscriptionId}</span>
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-4 min-w-[200px]">
                        {tier !== 'NONE' && (
                            <div className="text-right">
                                <span className="text-4xl font-bold text-white tracking-tighter">{info.price}</span>
                                <span className="text-brand-muted font-medium">/mo</span>
                            </div>
                        )}

                        {isActive ? (
                            <button className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary text-white px-5 py-2.5 rounded-[8px] font-medium flex items-center justify-center gap-2 transition-colors">
                                Manage in Lemon Squeezy
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        ) : (
                            <Link
                                to="/pricing"
                                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-[8px] font-bold flex items-center justify-center gap-2 transition-colors shadow-[0_0_25px_rgba(6,182,212,0.3)]"
                            >
                                Choose a Plan
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Subscription Details */}
            <div className="glass-panel border-brand-border/50">
                <div className="px-8 py-6 border-b border-brand-border/50">
                    <h3 className="text-lg font-bold text-white">Subscription Details</h3>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mb-1">Plan</p>
                            <p className="text-white font-medium">{info.label}</p>
                        </div>
                        <div>
                            <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mb-1">Status</p>
                            <p className={`font-medium ${isActive ? 'text-brand-secondary' : 'text-amber-400'}`}>
                                {isActive ? 'Active' : status}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mb-1">Monthly Cost</p>
                            <p className="text-white font-medium">{tier === 'NONE' ? '—' : `${info.price}/mo`}</p>
                        </div>
                        <div>
                            <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mb-1">Company</p>
                            <p className="text-white font-medium">{subscription?.name || '—'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

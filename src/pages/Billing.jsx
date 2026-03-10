import { useState, useEffect } from 'react';
import { CheckCircle2, ExternalLink, CreditCard, AlertCircle, Check, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TIER_INFO = {
    NONE: { label: 'No Plan', price: '$0', color: 'brand-muted' },
    STARTER: { label: 'Starter Plan', price: '$500', color: 'brand-primary' },
    GROWTH: { label: 'Growth Plan', price: '$1,500', color: 'brand-primary' },
};

const STARTER_FEATURES = [
    'Basic Integrations (Shopify, Meta)',
    'Standard KPI Dashboard',
    'Monthly Strategy Report',
    'Email Support',
];

const GROWTH_FEATURES = [
    'All Integrations (Inc. GA4, Klaviyo)',
    'Weekly Strategy Zoom Call',
    'Custom KPI Definitions',
    'Slack Channel Access',
    'Attribution Modeling',
];

export default function Billing() {
    const { token } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(null);

    useEffect(() => {
        const fetchBilling = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/status`, {
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

    const handleCheckout = async (tier) => {
        setCheckoutLoading(tier);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ tier }),
            });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to create checkout.');
                return;
            }

            window.location.href = data.checkoutUrl;
        } catch (err) {
            alert('Network error. Please try again.');
        } finally {
            setCheckoutLoading(null);
        }
    };

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
        <div className="max-w-5xl mx-auto space-y-8">
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
                                ? `You are on the fully-managed ${info.label}. Your subscription is active and billing is handled by Paddle.`
                                : "You don't have an active subscription yet. Choose a plan below to get started."}
                        </p>

                        {subscription?.paddleSubscriptionId && (
                            <div className="flex items-center gap-2 mt-4">
                                <CreditCard className="w-5 h-5 text-brand-muted" />
                                <span className="text-sm text-brand-muted">
                                    Subscription ID: <span className="text-white font-medium">{subscription.paddleSubscriptionId}</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {isActive && (
                        <div className="flex flex-col items-end gap-4 min-w-[200px]">
                            <div className="text-right">
                                <span className="text-4xl font-bold text-white tracking-tighter">{info.price}</span>
                                <span className="text-brand-muted font-medium">/mo</span>
                            </div>
                            <button className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary text-white px-5 py-2.5 rounded-[8px] font-medium flex items-center justify-center gap-2 transition-colors">
                                Manage Subscription
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Inline Plan Picker (shown when no active subscription) ── */}
            {!isActive && (
                <div>
                    <h3 className="text-lg font-bold text-white mb-5">Choose Your Plan</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Starter Plan Card */}
                        <div className="glass-panel p-8 flex flex-col border-brand-border/50 hover:border-brand-border transition-all duration-300 group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-brand-primary" />
                                </div>
                                <h4 className="text-xl font-bold text-white">Starter</h4>
                            </div>
                            <p className="text-brand-muted text-sm mb-6">Essential visibility for emerging brands.</p>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white tracking-tighter">$500</span>
                                <span className="text-brand-muted font-medium">/mo</span>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {STARTER_FEATURES.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-brand-muted">
                                        <Check className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleCheckout('STARTER')}
                                disabled={checkoutLoading === 'STARTER'}
                                className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {checkoutLoading === 'STARTER' ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Subscribe to Starter'
                                )}
                            </button>
                        </div>

                        {/* Growth Plan Card — Highlighted */}
                        <div className="glass-panel p-8 flex flex-col border-brand-primary/60 shadow-[0_0_40px_rgba(6,182,212,0.12)] hover:shadow-[0_0_60px_rgba(6,182,212,0.2)] transition-all duration-300 relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg shadow-brand-primary/30">
                                Most Popular
                            </div>

                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-brand-primary" />
                                </div>
                                <h4 className="text-xl font-bold text-white">Growth</h4>
                            </div>
                            <p className="text-brand-muted text-sm mb-6">The complete outsourced data department.</p>

                            <div className="mb-6 relative inline-block">
                                <div className="absolute inset-0 bg-brand-primary/15 blur-xl rounded-full" />
                                <span className="relative text-4xl font-bold tracking-tighter text-brand-primary">$1,500</span>
                                <span className="relative text-brand-muted font-medium">/mo</span>
                            </div>

                            <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-3">Everything in Starter, plus:</p>
                            <ul className="space-y-3 mb-8 flex-1">
                                {GROWTH_FEATURES.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm">
                                        <Check className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                                        <span className="text-white font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleCheckout('GROWTH')}
                                disabled={checkoutLoading === 'GROWTH'}
                                className="w-full bg-brand-primary hover:bg-brand-primary-hover shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {checkoutLoading === 'GROWTH' ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Subscribe to Growth'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription Details (always shown) */}
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

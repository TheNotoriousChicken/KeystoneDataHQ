import { useState } from 'react';
import { ShoppingBag, Facebook, LineChart, Mail, CheckCircle2, XCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const initialIntegrations = [
    {
        id: 'shopify',
        name: 'Shopify',
        description: 'Sync orders, customers, and product data in real-time.',
        icon: ShoppingBag,
        color: '#95BF47',
        status: 'disconnected',
        lastSync: 'Never'
    },
    {
        id: 'meta',
        name: 'Meta Ads',
        description: 'Pull ad spend, impressions, clicks, and attribution data.',
        icon: Facebook,
        color: '#1877F2',
        status: 'disconnected',
        lastSync: 'Never'
    },
    {
        id: 'ga4',
        name: 'Google Analytics 4',
        description: 'Track overall website traffic and blended conversion events.',
        icon: LineChart,
        color: '#F9AB00',
        status: 'disconnected',
        lastSync: 'Never'
    },
    {
        id: 'klaviyo',
        name: 'Klaviyo',
        description: 'Monitor email/SMS revenue and campaign performance.',
        icon: Mail,
        color: '#20C6B6',
        status: 'disconnected',
        lastSync: 'Never'
    }
];

export default function Integrations() {
    const { token } = useAuth();
    const [integrations, setIntegrations] = useState(initialIntegrations);

    // Shopify Modal State
    const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
    const [shopName, setShopName] = useState('');
    const [shopifyToken, setShopifyToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Meta Ads Modal State
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
    const [adAccountId, setAdAccountId] = useState('');
    const [metaToken, setMetaToken] = useState('');
    const [isMetaLoading, setIsMetaLoading] = useState(false);
    const [metaError, setMetaError] = useState(null);
    const [metaSuccess, setMetaSuccess] = useState(null);

    // GA4 Modal State
    const [isGa4ModalOpen, setIsGa4ModalOpen] = useState(false);
    const [ga4PropertyId, setGa4PropertyId] = useState('');
    const [ga4Credentials, setGa4Credentials] = useState('');
    const [isGa4Loading, setIsGa4Loading] = useState(false);
    const [ga4Error, setGa4Error] = useState(null);
    const [ga4Success, setGa4Success] = useState(null);

    // Klaviyo Modal State
    const [isKlaviyoModalOpen, setIsKlaviyoModalOpen] = useState(false);
    const [klaviyoApiKey, setKlaviyoApiKey] = useState('');
    const [isKlaviyoLoading, setIsKlaviyoLoading] = useState(false);
    const [klaviyoError, setKlaviyoError] = useState(null);
    const [klaviyoSuccess, setKlaviyoSuccess] = useState(null);

    const handleConnectClick = (integrationId) => {
        if (integrationId === 'shopify') {
            const shopifyInt = integrations.find(i => i.id === 'shopify');
            if (shopifyInt.status === 'disconnected') {
                setIsShopifyModalOpen(true);
                setError(null);
                setSuccessMsg(null);
                setShopName('');
                setShopifyToken('');
            } else {
                alert("Shopify is already connected.");
            }
        } else if (integrationId === 'meta') {
            const metaInt = integrations.find(i => i.id === 'meta');
            if (metaInt.status === 'disconnected') {
                setIsMetaModalOpen(true);
                setMetaError(null);
                setMetaSuccess(null);
                setAdAccountId('');
                setMetaToken('');
            } else {
                alert("Meta Ads is already connected.");
            }
        } else if (integrationId === 'ga4') {
            const int = integrations.find(i => i.id === 'ga4');
            if (int.status === 'disconnected') {
                setIsGa4ModalOpen(true);
                setGa4Error(null);
                setGa4Success(null);
                setGa4PropertyId('');
                setGa4Credentials('');
            } else {
                alert("Google Analytics 4 is already connected.");
            }
        } else if (integrationId === 'klaviyo') {
            const int = integrations.find(i => i.id === 'klaviyo');
            if (int.status === 'disconnected') {
                setIsKlaviyoModalOpen(true);
                setKlaviyoError(null);
                setKlaviyoSuccess(null);
                setKlaviyoApiKey('');
            } else {
                alert("Klaviyo is already connected.");
            }
        }
    };

    const handleConnectShopify = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const res = await fetch('http://localhost:4000/api/integrations/shopify/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ shopName, accessToken: shopifyToken })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to connect to Shopify.');
            }

            setSuccessMsg(data.message);
            setIntegrations(prev => prev.map(int =>
                int.id === 'shopify' ? { ...int, status: 'connected', lastSync: 'Just now' } : int
            ));

            setTimeout(() => {
                setIsShopifyModalOpen(false);
                setSuccessMsg(null);
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnectMeta = async (e) => {
        e.preventDefault();
        setIsMetaLoading(true);
        setMetaError(null);
        setMetaSuccess(null);

        try {
            const res = await fetch('http://localhost:4000/api/integrations/meta/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adAccountId, accessToken: metaToken })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to connect to Meta Ads.');
            }

            setMetaSuccess(data.message);
            setIntegrations(prev => prev.map(int =>
                int.id === 'meta' ? { ...int, status: 'connected', lastSync: 'Just now' } : int
            ));

            setTimeout(() => {
                setIsMetaModalOpen(false);
                setMetaSuccess(null);
            }, 2000);

        } catch (err) {
            setMetaError(err.message);
        } finally {
            setIsMetaLoading(false);
        }
    };

    const handleConnectGa4 = async (e) => {
        e.preventDefault();
        setIsGa4Loading(true);
        setGa4Error(null);
        setGa4Success(null);

        try {
            const res = await fetch('http://localhost:4000/api/integrations/ga4/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ propertyId: ga4PropertyId, credentialsJson: ga4Credentials })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to connect to GA4.');
            }

            setGa4Success(data.message);
            setIntegrations(prev => prev.map(int =>
                int.id === 'ga4' ? { ...int, status: 'connected', lastSync: 'Just now' } : int
            ));

            setTimeout(() => {
                setIsGa4ModalOpen(false);
                setGa4Success(null);
            }, 2000);

        } catch (err) {
            setGa4Error(err.message);
        } finally {
            setIsGa4Loading(false);
        }
    };

    const handleConnectKlaviyo = async (e) => {
        e.preventDefault();
        setIsKlaviyoLoading(true);
        setKlaviyoError(null);
        setKlaviyoSuccess(null);

        try {
            const res = await fetch('http://localhost:4000/api/integrations/klaviyo/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ apiKey: klaviyoApiKey })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to connect to Klaviyo.');
            }

            setKlaviyoSuccess(data.message);
            setIntegrations(prev => prev.map(int =>
                int.id === 'klaviyo' ? { ...int, status: 'connected', lastSync: 'Just now' } : int
            ));

            setTimeout(() => {
                setIsKlaviyoModalOpen(false);
                setKlaviyoSuccess(null);
            }, 2000);

        } catch (err) {
            setKlaviyoError(err.message);
        } finally {
            setIsKlaviyoLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 relative">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Connect Your Data Sources</h2>
                <p className="text-brand-muted mt-2">Manage your API connections to pull data into your dashboard.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {integrations.map((integration) => (
                    <div key={integration.id} className="glass-panel p-6 flex flex-col h-full border-brand-border/50 hover:border-brand-border transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-brand-border shadow-sm shadow-black/20" style={{ backgroundColor: `${integration.color}15` }}>
                                <integration.icon className="w-6 h-6" style={{ color: integration.color }} />
                            </div>
                            {integration.status === 'connected' ? (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-secondary/10 border border-brand-secondary/20">
                                    <CheckCircle2 className="w-4 h-4 text-brand-secondary" />
                                    <span className="text-xs font-medium text-brand-secondary">Connected</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-surface border border-brand-border">
                                    <XCircle className="w-4 h-4 text-brand-muted" />
                                    <span className="text-xs font-medium text-brand-muted">Disconnected</span>
                                </div>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">{integration.name}</h3>
                        <p className="text-sm text-brand-muted mb-6 flex-1 leading-relaxed">{integration.description}</p>

                        <div className="flex items-center justify-between pt-6 border-t border-brand-border/50">
                            <span className="text-xs text-brand-muted font-medium">
                                Last sync: {integration.lastSync}
                            </span>
                            <button
                                onClick={() => handleConnectClick(integration.id)}
                                className={`px-4 py-2 rounded-[8px] text-sm font-semibold transition-all ${integration.status === 'connected'
                                    ? 'bg-brand-surface border border-brand-border text-white hover:border-brand-primary'
                                    : 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20'
                                    }`}
                            >
                                {integration.status === 'connected' ? 'Manage' : 'Connect API'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ---- Shopify Connect Modal ---- */}
            {isShopifyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-md p-6 relative border-brand-border shadow-2xl animate-fade-in-up">
                        <button
                            onClick={() => setIsShopifyModalOpen(false)}
                            className="absolute top-4 right-4 text-brand-muted hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-brand-border" style={{ backgroundColor: '#95BF4715' }}>
                                <ShoppingBag className="w-5 h-5 text-[#95BF47]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Connect Shopify</h3>
                                <p className="text-sm text-brand-muted">Enter your custom app credentials</p>
                            </div>
                        </div>

                        <form onSubmit={handleConnectShopify} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1.5">Store Name</label>
                                <input
                                    type="text"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    placeholder="your-brand.myshopify.com"
                                    required
                                    className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1.5">Admin API Access Token</label>
                                <input
                                    type="password"
                                    value={shopifyToken}
                                    onChange={(e) => setShopifyToken(e.target.value)}
                                    placeholder="shpat_..."
                                    required
                                    className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                />
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
                                    disabled={isLoading}
                                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Connecting...
                                        </>
                                    ) : 'Connect Store'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ---- Meta Ads Connect Modal ---- */}
            {isMetaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-md p-6 relative border-brand-border shadow-2xl animate-fade-in-up">
                        <button
                            onClick={() => setIsMetaModalOpen(false)}
                            className="absolute top-4 right-4 text-brand-muted hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-brand-border" style={{ backgroundColor: '#1877F215' }}>
                                <Facebook className="w-5 h-5 text-[#1877F2]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Connect Meta Ads</h3>
                                <p className="text-sm text-brand-muted">Enter your Ad Account credentials</p>
                            </div>
                        </div>

                        <form onSubmit={handleConnectMeta} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1.5">Ad Account ID</label>
                                <input
                                    type="text"
                                    value={adAccountId}
                                    onChange={(e) => setAdAccountId(e.target.value)}
                                    placeholder="act_123456789..."
                                    required
                                    className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1.5">System User Access Token</label>
                                <input
                                    type="password"
                                    value={metaToken}
                                    onChange={(e) => setMetaToken(e.target.value)}
                                    placeholder="EAAB..."
                                    required
                                    className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                />
                            </div>

                            {metaError && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{metaError}</div>
                            )}
                            {metaSuccess && (
                                <div className="p-3 rounded-lg bg-brand-secondary/10 border border-brand-secondary/20 text-sm text-brand-secondary flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />{metaSuccess}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isMetaLoading}
                                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                                >
                                    {isMetaLoading ? (
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
            )}

            {/* ---- GA4 Connect Modal ---- */}
            {isGa4ModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-md p-6 relative border-brand-border shadow-2xl animate-fade-in-up">
                        <button
                            onClick={() => setIsGa4ModalOpen(false)}
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
                                <p className="text-sm text-brand-muted">Service Account Authentication</p>
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
                                    placeholder='{"type": "service_account", ...}'
                                    required
                                    rows={4}
                                    className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-xs"
                                />
                            </div>

                            {ga4Error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{ga4Error}</div>
                            )}
                            {ga4Success && (
                                <div className="p-3 rounded-lg bg-brand-secondary/10 border border-brand-secondary/20 text-sm text-brand-secondary flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />{ga4Success}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isGa4Loading}
                                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                                >
                                    {isGa4Loading ? (
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
            )}

            {/* ---- Klaviyo Connect Modal ---- */}
            {isKlaviyoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-md p-6 relative border-brand-border shadow-2xl animate-fade-in-up">
                        <button
                            onClick={() => setIsKlaviyoModalOpen(false)}
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
                            </div>

                            {klaviyoError && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{klaviyoError}</div>
                            )}
                            {klaviyoSuccess && (
                                <div className="p-3 rounded-lg bg-brand-secondary/10 border border-brand-secondary/20 text-sm text-brand-secondary flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />{klaviyoSuccess}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isKlaviyoLoading}
                                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                                >
                                    {isKlaviyoLoading ? (
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
            )}
        </div>
    );
}

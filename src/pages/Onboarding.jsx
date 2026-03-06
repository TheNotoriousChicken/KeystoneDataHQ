import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Database, Cable, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Onboarding() {
    const { user, token, saveSessionDirect } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Shopify State
    const [shopifyShopName, setShopifyShopName] = useState('');
    const [shopifyToken, setShopifyToken] = useState('');
    const [shopifyStatus, setShopifyStatus] = useState('idle'); // idle, loading, success, error

    // Meta State
    const [metaAccountId, setMetaAccountId] = useState('');
    const [metaToken, setMetaToken] = useState('');
    const [metaStatus, setMetaStatus] = useState('idle');

    const [error, setError] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleConnectShopify = async () => {
        if (!shopifyShopName || !shopifyToken) return;
        setShopifyStatus('loading');
        setError(null);
        try {
            const res = await fetch('http://localhost:4000/api/integrations/shopify/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ shopName: shopifyShopName, accessToken: shopifyToken })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setShopifyStatus('success');
        } catch (err) {
            setShopifyStatus('error');
            setError(err.message);
        }
    };

    const handleConnectMeta = async () => {
        if (!metaAccountId || !metaToken) return;
        setMetaStatus('loading');
        setError(null);
        try {
            const res = await fetch('http://localhost:4000/api/integrations/meta/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adAccountId: metaAccountId, accessToken: metaToken })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMetaStatus('success');
        } catch (err) {
            setMetaStatus('error');
            setError(err.message);
        }
    };

    const handleCompleteOnboarding = async () => {
        setIsSyncing(true);
        setError(null);
        try {
            // 1. Mark onboarding complete in DB
            const completeRes = await fetch('http://localhost:4000/api/auth/onboarding/complete', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const completeData = await completeRes.json();
            if (!completeRes.ok) throw new Error(completeData.error);

            // 2. Trigger initial data sync
            await fetch('http://localhost:4000/api/dashboard/sync', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }).catch(e => console.warn('Initial sync fell back: ', e)); // non-blocking for nav

            // 3. Update local auth context
            saveSessionDirect(token, {
                ...user,
                company: { ...user.company, onboardingCompleted: true }
            });

            // 4. Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
            setIsSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center py-12 px-4 animate-in fade-in duration-700">
            <div className="max-w-xl w-full">

                {/* Header Sequence */}
                <div className="flex flex-col items-center text-center space-y-4 mb-10">
                    <div className="w-16 h-16 bg-brand-surface border border-brand-border rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-brand-primary/20 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full blur-xl" />
                        <Database className="w-8 h-8 text-brand-primary relative z-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {step === 1 && "Welcome to Keystone"}
                        {step === 2 && "Connect Your Data"}
                        {step === 3 && "You're All Set!"}
                    </h1>
                    <p className="text-brand-muted text-sm max-w-sm">
                        {step === 1 && "Let's get your data warehouse configured in just a few steps."}
                        {step === 2 && "Sync Shopify and Meta Ads to power your analytics engine."}
                        {step === 3 && "We're importing your initial data payload now."}
                    </p>
                </div>

                {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-6 text-center">
                        {error}
                    </div>
                )}

                {/* Step 1: Welcome */}
                {step === 1 && (
                    <div className="glass-panel p-8 space-y-6 animate-in slide-in-from-right-8 duration-500">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-brand-border/50">
                                <span className="text-brand-muted text-sm">Account</span>
                                <span className="text-white font-medium">{user?.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-brand-border/50">
                                <span className="text-brand-muted text-sm">Workspace</span>
                                <span className="text-white font-medium">{user?.company?.name}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-brand-muted text-sm">Role</span>
                                <span className="text-brand-primary font-medium">{user?.role}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            Next: Data Integrations
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Step 2: Integrations */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                        {/* Shopify Connect */}
                        <div className="glass-panel p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <Cable className="w-5 h-5 text-emerald-400" /> Shopify
                                </h3>
                                {shopifyStatus === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                            </div>
                            {shopifyStatus !== 'success' ? (
                                <div className="space-y-4 mt-2">
                                    <div>
                                        <label className="text-xs text-brand-muted uppercase font-bold tracking-wider mb-1 block">Shop Name</label>
                                        <input
                                            type="text"
                                            value={shopifyShopName}
                                            onChange={(e) => setShopifyShopName(e.target.value)}
                                            placeholder="yourstore.myshopify.com"
                                            className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary transition-colors text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-brand-muted uppercase font-bold tracking-wider mb-1 block">Admin API Token</label>
                                        <input
                                            type="password"
                                            value={shopifyToken}
                                            onChange={(e) => setShopifyToken(e.target.value)}
                                            placeholder="shpat_..."
                                            className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary transition-colors text-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={handleConnectShopify}
                                        disabled={shopifyStatus === 'loading' || !shopifyShopName || !shopifyToken}
                                        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
                                    >
                                        {shopifyStatus === 'loading' ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Connect Shopify'}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-brand-muted">Shopify is successfully connected.</p>
                            )}
                        </div>

                        {/* Meta Connect */}
                        <div className="glass-panel p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <Cable className="w-5 h-5 text-blue-400" /> Meta Ads
                                </h3>
                                {metaStatus === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                            </div>
                            {metaStatus !== 'success' ? (
                                <div className="space-y-4 mt-2">
                                    <div>
                                        <label className="text-xs text-brand-muted uppercase font-bold tracking-wider mb-1 block">Ad Account ID</label>
                                        <input
                                            type="text"
                                            value={metaAccountId}
                                            onChange={(e) => setMetaAccountId(e.target.value)}
                                            placeholder="act_1234567890"
                                            className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary transition-colors text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-brand-muted uppercase font-bold tracking-wider mb-1 block">Access Token</label>
                                        <input
                                            type="password"
                                            value={metaToken}
                                            onChange={(e) => setMetaToken(e.target.value)}
                                            placeholder="EAAB..."
                                            className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary transition-colors text-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={handleConnectMeta}
                                        disabled={metaStatus === 'loading' || !metaAccountId || !metaToken}
                                        className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
                                    >
                                        {metaStatus === 'loading' ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Connect Meta Ads'}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-brand-muted">Meta Ads is successfully connected.</p>
                            )}
                        </div>

                        <button
                            onClick={() => setStep(3)}
                            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 mt-4"
                        >
                            {(shopifyStatus === 'success' && metaStatus === 'success') ? 'Finalize Setup' : 'Skip & Finalize Setup'}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Step 3: Syncing & Finish */}
                {step === 3 && (
                    <div className="glass-panel p-10 text-center space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="flex justify-center">
                            <RefreshCw className={`w-12 h-12 text-brand-primary ${isSyncing ? 'animate-spin' : ''}`} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Initializing Dashboard</h2>
                        <p className="text-brand-muted text-sm max-w-sm mx-auto">
                            We are configuring your workspace and bringing in your first data sync.
                        </p>

                        <button
                            onClick={handleCompleteOnboarding}
                            disabled={isSyncing}
                            className="w-full mt-6 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                            {isSyncing ? 'Syncing...' : 'Enter Dashboard'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

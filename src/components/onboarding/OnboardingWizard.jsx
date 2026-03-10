import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, CheckCircle2, ChevronRight, Zap, Sparkles, Plug, RefreshCw } from 'lucide-react';
import ShopifyModal from '../integrations/ShopifyModal';
import MetaModal from '../integrations/MetaModal';
import Ga4Modal from '../integrations/Ga4Modal';
import KlaviyoModal from '../integrations/KlaviyoModal';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export default function OnboardingWizard({ initialStep = 1, onComplete }) {
    const { token, user } = useAuth();
    const queryClient = useQueryClient();
    const API = import.meta.env.VITE_API_URL;

    const [currentStep, setCurrentStep] = useState(initialStep);

    // Integrations State
    const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
    const [isGa4ModalOpen, setIsGa4ModalOpen] = useState(false);
    const [isKlaviyoModalOpen, setIsKlaviyoModalOpen] = useState(false);

    // Fetch integrations status
    const { data: statusData } = useQuery({
        queryKey: ['integrationStatus'],
        queryFn: async () => {
            const res = await fetch(`${API}/api/integrations/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch status');
            return res.json();
        },
        enabled: currentStep === 2
    });

    const hasAnyIntegration = statusData && Object.values(statusData).some(status => status === true);

    // Plan Selection Query
    const checkoutMutation = useMutation({
        mutationFn: async (tier) => {
            const res = await fetch(`${API}/api/billing/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tier })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate checkout link');
            return data.checkoutUrl;
        },
        onSuccess: (url) => {
            window.location.href = url; // Redirect to Paddle checkout
        }
    });

    // Start Sync Mutation
    const syncMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API}/api/dashboard/sync`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Sync failed.');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            onComplete();
        }
    });

    const handleNextStep = () => setCurrentStep(prev => prev + 1);

    const renderStep1 = () => (
        <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-3">Choose Your Plan</h2>
                <p className="text-brand-muted">Select a plan to activate your workspace and start syncing data.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Starter Plan */}
                <div className="glass-panel p-8 border-brand-border/50 hover:border-brand-primary/50 transition-colors flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-brand-primary" />
                        <h3 className="text-2xl font-bold text-white">Starter</h3>
                    </div>
                    <p className="text-brand-muted mb-6">Essential visibility for emerging brands.</p>
                    <div className="mb-8">
                        <span className="text-4xl font-bold text-white tracking-tighter">$500</span>
                        <span className="text-brand-muted font-medium">/mo</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                        {['Basic Integrations (Shopify, Meta)', 'Standard KPI Dashboard', 'Monthly Strategy Report'].map(feature => (
                            <li key={feature} className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-brand-secondary shrink-0" />
                                <span className="text-brand-muted text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => checkoutMutation.mutate('STARTER')}
                        disabled={checkoutMutation.isPending}
                        className="w-full py-3 rounded-lg bg-brand-surface border border-brand-border text-white font-semibold hover:border-brand-primary transition-all disabled:opacity-50"
                    >
                        {checkoutMutation.isPending ? 'Processing...' : 'Select Starter'}
                    </button>
                </div>

                {/* Growth Plan */}
                <div className="glass-panel p-8 border-brand-primary shadow-[0_0_30px_rgba(6,182,212,0.1)] relative flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Recommended
                    </div>
                    <div className="flex items-center gap-2 mb-2 mt-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h3 className="text-2xl font-bold text-white">Growth</h3>
                    </div>
                    <p className="text-brand-muted mb-6">The complete outsourced data department.</p>
                    <div className="mb-8 relative inline-block">
                        <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full" />
                        <span className="relative text-4xl font-bold tracking-tighter text-brand-primary">$1,500</span>
                        <span className="relative text-brand-muted font-medium">/mo</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                        {['All Integrations (Inc. GA4, Klaviyo)', 'Weekly Strategy Zoom Call', 'Custom KPI Definitions', 'Attribution Modeling'].map(feature => (
                            <li key={feature} className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-brand-primary shrink-0 drop-shadow-sm" />
                                <span className="text-white text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => checkoutMutation.mutate('GROWTH')}
                        disabled={checkoutMutation.isPending}
                        className="w-full py-3 rounded-lg bg-brand-primary hover:bg-brand-primary-hover shadow-[0_0_20px_rgba(6,182,212,0.3)] text-white font-bold transition-all disabled:opacity-50"
                    >
                        {checkoutMutation.isPending ? 'Processing...' : 'Select Growth'}
                    </button>
                </div>
            </div>

            {checkoutMutation.error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-center rounded-lg">
                    {checkoutMutation.error.message}
                </div>
            )}
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Plug className="w-8 h-8 text-brand-primary" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Connect Data Sources</h2>
                <p className="text-brand-muted">Connect your platforms to start pulling metrics into your dashboard.</p>
            </div>

            <div className="space-y-4 mb-10">
                {[
                    { id: 'shopify', name: 'Shopify', desc: 'Orders & Customers', action: () => setIsShopifyModalOpen(true) },
                    { id: 'meta', name: 'Meta Ads', desc: 'Ad Spend & Impressions', action: () => setIsMetaModalOpen(true) },
                    { id: 'ga4', name: 'Google Analytics 4', desc: 'Traffic & Conversion', action: () => setIsGa4ModalOpen(true) },
                    { id: 'klaviyo', name: 'Klaviyo', desc: 'Email Campaigns', action: () => setIsKlaviyoModalOpen(true) }
                ].map(int => (
                    <div key={int.id} className="glass-panel p-4 flex items-center justify-between border-brand-border/50 hover:border-brand-border transition-colors">
                        <div>
                            <h4 className="text-white font-semibold">{int.name}</h4>
                            <p className="text-xs text-brand-muted">{int.desc}</p>
                        </div>
                        {statusData?.[int.id] ? (
                            <div className="flex items-center gap-2 text-brand-secondary text-sm font-medium px-4 py-2 bg-brand-secondary/10 border border-brand-secondary/20 rounded-lg">
                                <CheckCircle2 className="w-4 h-4" /> Connected
                            </div>
                        ) : (
                            <button
                                onClick={int.action}
                                className="px-4 py-2 text-sm font-semibold bg-brand-surface border border-brand-border text-white rounded-lg hover:border-brand-primary transition-colors"
                            >
                                Connect
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={handleNextStep}
                disabled={!hasAnyIntegration}
                className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-surface disabled:text-brand-muted text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
                Continue to Dashboard
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {!hasAnyIntegration && <p className="text-center text-xs text-brand-muted mt-3">Connect at least one integration to continue.</p>}

            {/* Modals */}
            <ShopifyModal isOpen={isShopifyModalOpen} onClose={() => setIsShopifyModalOpen(false)} />
            <MetaModal isOpen={isMetaModalOpen} onClose={() => setIsMetaModalOpen(false)} />
            <Ga4Modal isOpen={isGa4ModalOpen} onClose={() => setIsGa4ModalOpen(false)} />
            <KlaviyoModal isOpen={isKlaviyoModalOpen} onClose={() => setIsKlaviyoModalOpen(false)} />
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg mx-auto text-center">
            <div className="glass-panel p-12 space-y-6">
                <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-2 relative">
                    <div className="absolute inset-0 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                    <RefreshCw className="w-8 h-8 text-brand-primary" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white mb-3">Initializing Workspace</h2>
                    <p className="text-brand-muted leading-relaxed">
                        We're pulling the initial dataset from your connected integrations. This might take a few moments.
                    </p>
                </div>

                <button
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                    className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                >
                    {syncMutation.isPending ? 'Syncing...' : 'Start Initial Sync'}
                </button>
                {syncMutation.error && (
                    <p className="text-red-400 text-sm">{syncMutation.error.message}</p>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 relative z-10 w-full animate-in fade-in duration-500">
            {/* Step Indicators */}
            <div className="flex items-center gap-3 mb-12">
                {[1, 2, 3].map(step => (
                    <div key={step} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentStep > step ? 'bg-brand-secondary text-brand-bg' :
                                currentStep === step ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20' :
                                    'bg-brand-surface border border-brand-border text-brand-muted'
                            }`}>
                            {currentStep > step ? <Check className="w-4 h-4" /> : step}
                        </div>
                        {step < 3 && <div className={`w-8 h-[2px] rounded-full ${currentStep > step ? 'bg-brand-secondary' : 'bg-brand-border'}`} />}
                    </div>
                ))}
            </div>

            <div className="w-full">
                <AnimatePresence mode="wait">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </AnimatePresence>
            </div>
        </div>
    );
}

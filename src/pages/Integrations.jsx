import { useState } from 'react';
import { ShoppingBag, Facebook, LineChart, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';

import ShopifyModal from '../components/integrations/ShopifyModal';
import MetaModal from '../components/integrations/MetaModal';
import Ga4Modal from '../components/integrations/Ga4Modal';
import KlaviyoModal from '../components/integrations/KlaviyoModal';

const integrationDefinitions = [
    {
        id: 'shopify', name: 'Shopify',
        description: 'Sync orders, customers, and product data in real-time.',
        icon: ShoppingBag, color: '#95BF47'
    },
    {
        id: 'meta', name: 'Meta Ads',
        description: 'Pull ad spend, impressions, clicks, and attribution data.',
        icon: Facebook, color: '#1877F2'
    },
    {
        id: 'ga4', name: 'Google Analytics 4',
        description: 'Track overall website traffic and blended conversion events.',
        icon: LineChart, color: '#F9AB00'
    },
    {
        id: 'klaviyo', name: 'Klaviyo',
        description: 'Monitor email/SMS revenue and campaign performance.',
        icon: Mail, color: '#20C6B6'
    }
];

export default function Integrations() {
    const { token } = useAuth();
    const API = import.meta.env.VITE_API_URL;

    const { data: statusData, isLoading: fetchLoading } = useQuery({
        queryKey: ['integrationStatus'],
        queryFn: async () => {
            const res = await fetch(`${API}/api/integrations/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch status');
            return res.json();
        }
    });

    const integrations = integrationDefinitions.map(def => ({
        ...def,
        status: statusData?.[def.id] ? 'connected' : 'disconnected',
        lastSync: statusData?.[def.id] ? 'Unknown' : 'Never'
    }));

    // Modal Visibility State
    const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
    const [isGa4ModalOpen, setIsGa4ModalOpen] = useState(false);
    const [isKlaviyoModalOpen, setIsKlaviyoModalOpen] = useState(false);

    const handleConnectClick = (integrationId) => {
        const int = integrations.find(i => i.id === integrationId);
        if (int.status === 'connected') {
            alert(`${int.name} is already connected.`);
            return;
        }

        switch (integrationId) {
            case 'shopify': setIsShopifyModalOpen(true); break;
            case 'meta': setIsMetaModalOpen(true); break;
            case 'ga4': setIsGa4ModalOpen(true); break;
            case 'klaviyo': setIsKlaviyoModalOpen(true); break;
            default: break;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 relative">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Connect Your Data Sources</h2>
                <p className="text-brand-muted mt-2">Manage your API connections to pull data into your dashboard.</p>
            </div>

            {fetchLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                </div>
            ) : (
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
            )}

            {/* Modals */}
            <ShopifyModal
                isOpen={isShopifyModalOpen}
                onClose={() => setIsShopifyModalOpen(false)}
            />
            <MetaModal
                isOpen={isMetaModalOpen}
                onClose={() => setIsMetaModalOpen(false)}
            />
            <Ga4Modal
                isOpen={isGa4ModalOpen}
                onClose={() => setIsGa4ModalOpen(false)}
            />
            <KlaviyoModal
                isOpen={isKlaviyoModalOpen}
                onClose={() => setIsKlaviyoModalOpen(false)}
            />
        </div>
    );
}

import { ShoppingBag, Facebook, LineChart, Mail, CheckCircle2, XCircle } from 'lucide-react';

const integrations = [
    {
        id: 'shopify',
        name: 'Shopify',
        description: 'Sync orders, customers, and product data in real-time.',
        icon: ShoppingBag,
        color: '#95BF47',
        status: 'connected',
        lastSync: '10 mins ago'
    },
    {
        id: 'meta',
        name: 'Meta Ads',
        description: 'Pull ad spend, impressions, clicks, and attribution data.',
        icon: Facebook,
        color: '#1877F2',
        status: 'connected',
        lastSync: '15 mins ago'
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
    return (
        <div className="max-w-5xl mx-auto space-y-8">
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
        </div>
    );
}

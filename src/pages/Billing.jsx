import { CheckCircle2, Download, ExternalLink, CreditCard } from 'lucide-react';

const invoices = [
    { id: 'INV-2026-003', date: 'Mar 01, 2026', amount: '$1,500.00', status: 'paid' },
    { id: 'INV-2026-002', date: 'Feb 01, 2026', amount: '$1,500.00', status: 'paid' },
    { id: 'INV-2026-001', date: 'Jan 01, 2026', amount: '$500.00', status: 'paid' },
];

export default function Billing() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Subscription & Billing</h2>
                <p className="text-brand-muted mt-2">Manage your plan and download past invoices.</p>
            </div>

            {/* Current Plan Card */}
            <div className="glass-panel p-8 border-brand-primary/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">Growth Plan</h3>
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-secondary/10 border border-brand-secondary/20 text-xs font-medium text-brand-secondary">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Active
                            </span>
                        </div>
                        <p className="text-brand-muted text-sm max-w-md">
                            You are on the fully-managed Growth plan. Your next billing date is <strong className="text-white">April 1st, 2026</strong>.
                        </p>

                        <div className="flex items-center gap-2 mt-6">
                            <CreditCard className="w-5 h-5 text-brand-muted" />
                            <div className="flex items-center text-sm font-medium text-brand-muted">
                                <span className="px-1.5 py-0.5 rounded bg-brand-surface border border-brand-border text-xs mr-2">Visa</span>
                                •••• 4242
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 min-w-[200px]">
                        <div className="text-right">
                            <span className="text-4xl font-bold text-white tracking-tighter">$1,500</span>
                            <span className="text-brand-muted font-medium">/mo</span>
                        </div>
                        <button className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary text-white px-5 py-2.5 rounded-[8px] font-medium flex items-center justify-center gap-2 transition-colors">
                            Manage in Lemon Squeezy
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoices */}
            <div className="glass-panel border-brand-border/50">
                <div className="px-8 py-6 border-b border-brand-border/50">
                    <h3 className="text-lg font-bold text-white">Invoice History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-brand-surface/30 text-brand-muted uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-8 py-4 font-semibold">Invoice Number</th>
                                <th className="px-8 py-4 font-semibold">Date</th>
                                <th className="px-8 py-4 font-semibold">Amount</th>
                                <th className="px-8 py-4 font-semibold">Status</th>
                                <th className="px-8 py-4 font-semibold text-right">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/50">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-brand-surface/30 transition-colors">
                                    <td className="px-8 py-5 font-medium text-white">{inv.id}</td>
                                    <td className="px-8 py-5 text-brand-muted">{inv.date}</td>
                                    <td className="px-8 py-5 text-white font-medium">{inv.amount}</td>
                                    <td className="px-8 py-5">
                                        <span className="flex items-center gap-1.5 text-brand-secondary font-medium text-xs">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Paid
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary-hover font-medium transition-colors">
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

import { FileText, Download, Calendar, Search } from 'lucide-react';

const reports = [
    { id: 1, date: 'Mar 01, 2026', type: 'Weekly', insight: 'ROAS increased by 12% following new creative launch on Meta.', status: 'Ready' },
    { id: 2, date: 'Feb 28, 2026', type: 'Monthly', insight: 'February recap: $142k total revenue, CAC dropped to $24.', status: 'Ready' },
    { id: 3, date: 'Feb 22, 2026', type: 'Weekly', insight: 'Identified drop in checkout conversion rate; recommend optimizing Shopify cart.', status: 'Ready' },
    { id: 4, date: 'Feb 15, 2026', type: 'Weekly', insight: 'Valentine\'s day promo resulted in a 40% spike in repeat purchaser rate.', status: 'Ready' },
    { id: 5, date: 'Feb 08, 2026', type: 'Weekly', insight: 'Steady performance across all channels. Search impression share up 5%.', status: 'Ready' },
];

export default function Reports() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Strategy Reports & Insights</h2>
                    <p className="text-brand-muted mt-2">Archive of all human-reviewed strategy documents.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            className="pl-9 pr-4 py-2 bg-brand-surface/50 border border-brand-border rounded-[8px] text-sm text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary placeholder:text-brand-muted transition-all"
                        />
                    </div>
                    <button className="glass-panel px-4 py-2 flex items-center gap-2 hover:border-brand-primary transition-colors text-sm font-medium">
                        <Calendar className="w-4 h-4 text-brand-muted" />
                        Filter by Date
                    </button>
                </div>
            </div>

            <div className="glass-panel overflow-hidden border-brand-border/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-brand-surface/50 text-brand-muted uppercase tracking-wider text-xs border-b border-brand-border/50">
                            <tr>
                                <th className="px-6 py-5 font-semibold">Date Generated</th>
                                <th className="px-6 py-5 font-semibold">Report Type</th>
                                <th className="px-6 py-5 font-semibold">Key Insight Summary</th>
                                <th className="px-6 py-5 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/50">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-brand-surface/30 transition-colors group cursor-pointer">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-brand-surface flex items-center justify-center border border-brand-border text-brand-muted group-hover:text-brand-primary transition-colors">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-white">{report.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${report.type === 'Weekly'
                                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                            }`}>
                                            {report.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-brand-muted whitespace-normal max-w-md">
                                        {report.insight}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary-hover font-medium transition-colors">
                                            <Download className="w-4 h-4" />
                                            Download PDF
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

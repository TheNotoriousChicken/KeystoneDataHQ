import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Target, MousePointerClick, ShoppingCart } from 'lucide-react';

const revenueData = [
    { name: '1', revenue: 4000, spend: 2400 },
    { name: '5', revenue: 3000, spend: 1398 },
    { name: '10', revenue: 2000, spend: 9800 },
    { name: '15', revenue: 2780, spend: 3908 },
    { name: '20', revenue: 1890, spend: 4800 },
    { name: '25', revenue: 2390, spend: 3800 },
    { name: '30', revenue: 3490, spend: 4300 },
];

const sourceData = [
    { name: 'Organic Search', value: 400 },
    { name: 'Meta Ads', value: 300 },
    { name: 'Direct', value: 300 },
    { name: 'Referral', value: 200 },
];

const COLORS = ['#06B6D4', '#10B981', '#F59E0B', '#6366F1'];

const topProducts = [
    { id: 1, name: 'Premium Wireless Headphones', image: '🎧', units: 142, rate: '4.2%' },
    { id: 2, name: 'Ergonomic Desk Chair', image: '🪑', units: 89, rate: '2.8%' },
    { id: 3, name: 'Mechanical Keyboard v2', image: '⌨️', units: 67, rate: '3.5%' },
];

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                            <DollarSign className="w-5 h-5 text-brand-primary" />
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3" />
                            12.5%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-brand-muted mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-white">$45,231.89</h3>
                </div>

                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-brand-secondary/10 rounded-lg">
                            <Target className="w-5 h-5 text-brand-secondary" />
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3" />
                            4.2%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-brand-muted mb-1">Blended ROAS</p>
                    <h3 className="text-3xl font-bold text-white">4.2x</h3>
                </div>

                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                            <MousePointerClick className="w-5 h-5 text-rose-500" />
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full">
                            <ArrowDownRight className="w-3 h-3" />
                            2.1%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-brand-muted mb-1">Blended CAC</p>
                    <h3 className="text-3xl font-bold text-white">$24.50</h3>
                </div>

                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-fuchsia-500/10 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-fuchsia-500" />
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3" />
                            8.4%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-brand-muted mb-1">Total Orders</p>
                    <h3 className="text-3xl font-bold text-white">1,842</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Line Chart */}
                <div className="glass-panel p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-6">Revenue vs Ad Spend</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#FFFFFF' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4, fill: '#06B6D4', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="spend" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Sales by Source</h3>
                    <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sourceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#FFFFFF' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        {sourceData.map((source, idx) => (
                            <div key={source.name} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                                <span className="text-sm text-brand-muted">{source.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="glass-panel">
                <div className="px-6 py-5 border-b border-brand-border">
                    <h3 className="text-lg font-bold text-white">Top Performing Products</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-brand-surface/50 text-brand-muted uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Product</th>
                                <th className="px-6 py-4 font-semibold">Units Sold</th>
                                <th className="px-6 py-4 font-semibold">Conversion Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {topProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-brand-surface/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-brand-surface flex items-center justify-center text-xl border border-brand-border">
                                                {product.image}
                                            </div>
                                            <span className="font-medium text-white">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-brand-muted font-medium">{product.units}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20">
                                            {product.rate}
                                        </span>
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

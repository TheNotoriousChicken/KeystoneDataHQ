import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import DataTable from "../components/ui/DataTable";
import type { Column } from "../components/ui/DataTable";
import { executiveDashboardData } from "../data/mockDatabase";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
};

const formatShortCurrency = (value: number) => {
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}k`;
    }
    return formatCurrency(value);
};

export default function Revenue() {
    const { kpis, revenueByService } = executiveDashboardData;

    const arr = kpis.mrr * 12;

    const expenseData = [
        { category: "Payroll & Benefits", cost: 65000 },
        { category: "Software & Licenses", cost: 12500 },
        { category: "Legal & Professional", cost: 4200 },
        { category: "Office & Operations", cost: 3500 },
    ];

    const expenseColumns: Column<any>[] = [
        { key: "category", header: "Expense Category" },
        {
            key: "cost",
            header: "Monthly Cost",
            align: "right",
            cell: (item: any) => formatCurrency(item.cost)
        },
    ];

    return (
        <div>
            <h1 className="text-2xl font-semibold text-text-main mb-8">Revenue Intelligence</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard
                    title="ARR"
                    value={formatCurrency(arr)}
                    trend={15.2}
                    trendLabel="vs last year"
                    isGood={true}
                />
                <MetricCard
                    title="Average Deal Size"
                    value={formatCurrency(10178)}
                    trend={4.1}
                    trendLabel="vs last quarter"
                    isGood={true}
                />
                <MetricCard
                    title="Margin Leakage"
                    value={formatCurrency(4200)}
                    trend={-12.5}
                    trendLabel="vs last month"
                    isGood={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Revenue by Service Line">
                    <div className="h-[300px] w-full mt-4 text-sm">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByService}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={formatShortCurrency}
                                />
                                <Tooltip
                                    cursor={{ fill: "#232736" }}
                                    contentStyle={{
                                        backgroundColor: "#1a1d27",
                                        borderColor: "#2a2e3d",
                                        color: "#f3f4f6",
                                        borderRadius: "12px",
                                    }}
                                    itemStyle={{ color: "#f3f4f6" }}
                                    formatter={(value: any) => formatCurrency(Number(value))}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Operating Expenses">
                    <DataTable columns={expenseColumns} data={expenseData} />
                </Card>
            </div>
        </div>
    );
}

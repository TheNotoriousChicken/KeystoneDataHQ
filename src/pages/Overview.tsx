import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import type { Column } from "../components/ui/DataTable";
import { executiveDashboardData } from "../data/mockDatabase";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
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

const formatPercent = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "percent",
        maximumFractionDigits: 1,
    }).format(value / 100);
};

export default function Overview() {
    const { kpis, revenueTrend, topClients } = executiveDashboardData;

    const clientColumns: Column<any>[] = [
        { key: "name", header: "Client Name" },
        { key: "primaryTech", header: "Primary Tech" },
        { key: "mrr", header: "MRR", align: "right" },
        { key: "margin", header: "Margin", align: "right" },
        { key: "status", header: "Status", align: "right" },
    ];

    const mappedClients = topClients.map((client) => ({
        ...client,
        mrr: formatCurrency(client.mrr),
        margin: formatPercent(client.margin),
        status: (
            <Badge
                variant={
                    client.status === "Healthy"
                        ? "success"
                        : client.status === "At Risk"
                            ? "warning"
                            : "danger"
                }
            >
                {client.status}
            </Badge>
        ),
    }));

    return (
        <div>
            <h1 className="text-2xl font-semibold text-text-main mb-8">Executive Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="MRR"
                    value={formatCurrency(kpis.mrr)}
                    trend={5.2}
                    trendLabel="vs last month"
                    isGood={true}
                />
                <MetricCard
                    title="YTD Revenue"
                    value={formatCurrency(kpis.ytdRevenue)}
                    trend={12.5}
                    trendLabel="vs last year"
                    isGood={true}
                />
                <MetricCard
                    title="Avg Margin"
                    value={formatPercent(kpis.averageMargin)}
                    trend={1.2}
                    trendLabel="vs last month"
                    isGood={true}
                />
                <MetricCard
                    title="Utilization"
                    value={formatPercent(kpis.consultantUtilization)}
                    trend={-2.4}
                    trendLabel="vs last month"
                    isGood={false}
                />
            </div>

            <Card title="Revenue & Profit Trend" className="mb-8">
                <div className="h-[350px] w-full mt-4 text-sm">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" vertical={false} />
                            <XAxis
                                dataKey="month"
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
                                contentStyle={{
                                    backgroundColor: "#1a1d27",
                                    borderColor: "#2a2e3d",
                                    color: "#f3f4f6",
                                    borderRadius: "12px",
                                }}
                                itemStyle={{ color: "#f3f4f6" }}
                                formatter={(value: any) => formatCurrency(Number(value))}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.1}
                            />
                            <Area
                                type="monotone"
                                dataKey="profit"
                                name="Profit"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.1}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card title="Key Accounts Risk Profile">
                <DataTable columns={clientColumns} data={mappedClients} />
            </Card>
        </div>
    );
}

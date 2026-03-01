import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
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

export default function Forecast() {
    const { forecastData } = executiveDashboardData;

    const totalBase = forecastData.reduce((sum, f) => sum + f.baseRevenue, 0);
    const totalPipeline = forecastData.reduce((sum, f) => sum + f.weightedPipeline, 0);

    return (
        <div>
            <h1 className="text-2xl font-semibold text-text-main mb-8">90-Day Revenue Forecast</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard
                    title="Projected Base (90d)"
                    value={formatCurrency(totalBase)}
                    trend={8.4}
                    trendLabel="growth"
                    isGood={true}
                />
                <MetricCard
                    title="Weighted Pipeline"
                    value={formatCurrency(totalPipeline)}
                    trend={12.1}
                    trendLabel="growth"
                    isGood={true}
                />
                <MetricCard
                    title="Total Pipeline Coverage"
                    value="2.4x"
                    trend={0.2}
                    trendLabel="vs historical"
                    isGood={true}
                />
            </div>

            <Card title="Base vs Pipeline" className="mb-8">
                <div className="h-[350px] w-full mt-4 text-sm">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastData}>
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
                                dataKey="baseRevenue"
                                name="Base Revenue"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.1}
                            />
                            <Area
                                type="monotone"
                                dataKey="weightedPipeline"
                                name="Weighted Pipeline"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.1}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}

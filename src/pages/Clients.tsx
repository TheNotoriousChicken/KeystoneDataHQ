import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import type { Column } from "../components/ui/DataTable";
import { executiveDashboardData } from "../data/mockDatabase";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
};

const formatPercent = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "percent",
        maximumFractionDigits: 1,
    }).format(value / 100);
};

export default function Clients() {
    const { fullClientList } = executiveDashboardData;

    const totalClients = fullClientList.length;

    const atRiskMrr = fullClientList.reduce((sum, client) => {
        if (client.status === "At Risk" || client.status === "Churning") {
            return sum + client.mrr;
        }
        return sum;
    }, 0);

    const avgMargin =
        fullClientList.reduce((sum, client) => sum + client.margin, 0) /
        (totalClients || 1);

    const clientColumns: Column<any>[] = [
        { key: "name", header: "Client Name" },
        { key: "primaryTech", header: "Primary Tech" },
        { key: "mrr", header: "MRR", align: "right" },
        { key: "margin", header: "Margin", align: "right" },
        { key: "status", header: "Status", align: "center" },
        { key: "lastReviewDate", header: "Last Review", align: "right" },
    ];

    const mappedClients = fullClientList.map((client) => ({
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
            <h1 className="text-2xl font-semibold text-text-main mb-8">Client Portfolio</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard
                    title="Total Active Clients"
                    value={totalClients}
                    trend={2}
                    trendLabel="new this quarter"
                    isGood={true}
                />
                <MetricCard
                    title="At-Risk MRR"
                    value={formatCurrency(atRiskMrr)}
                    trend={-5.4}
                    trendLabel="vs last quarter"
                    isGood={true}
                />
                <MetricCard
                    title="Average Client Margin"
                    value={formatPercent(avgMargin)}
                    trend={1.2}
                    trendLabel="vs last month"
                    isGood={true}
                />
            </div>

            <Card title="Full Client Roster">
                <DataTable columns={clientColumns} data={mappedClients} />
            </Card>
        </div>
    );
}

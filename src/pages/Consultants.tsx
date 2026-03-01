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

export default function Consultants() {
    const { consultantsList } = executiveDashboardData;

    const totalHeadcount = consultantsList.length;
    const benchedCount = consultantsList.filter((c) => c.status === "Benched").length;
    const avgUtilization =
        consultantsList.reduce((sum, c) => sum + c.utilization, 0) / (totalHeadcount || 1);

    const columns: Column<any>[] = [
        { key: "name", header: "Name" },
        { key: "role", header: "Role" },
        { key: "billableRate", header: "Billable Rate", align: "right" },
        { key: "utilization", header: "Utilization", align: "right" },
        { key: "status", header: "Status", align: "center" },
    ];

    const mappedData = consultantsList.map((c) => ({
        ...c,
        billableRate: formatCurrency(c.billableRate) + "/hr",
        utilization: formatPercent(c.utilization),
        status: (
            <Badge
                variant={
                    c.status === "Optimal"
                        ? "success"
                        : c.status === "Overutilized"
                            ? "warning"
                            : "danger"
                }
            >
                {c.status}
            </Badge>
        ),
    }));

    return (
        <div>
            <h1 className="text-2xl font-semibold text-text-main mb-8">Resource Utilization</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard
                    title="Total Billable Headcount"
                    value={totalHeadcount}
                    trend={1}
                    trendLabel="new hire"
                    isGood={true}
                />
                <MetricCard
                    title="Average Utilization"
                    value={formatPercent(avgUtilization)}
                    trend={-2.1}
                    trendLabel="vs last month"
                    isGood={false}
                />
                <MetricCard
                    title="Benched Resources"
                    value={benchedCount}
                    trend={1}
                    trendLabel="vs last week"
                    isGood={false}
                />
            </div>

            <Card title="Consultant Roster">
                <DataTable columns={columns} data={mappedData} />
            </Card>
        </div>
    );
}

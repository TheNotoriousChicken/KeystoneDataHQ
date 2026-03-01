export interface KPI {
    mrr: number;
    ytdRevenue: number;
    averageMargin: number;
    activeClients: number;
    consultantUtilization: number;
}

export interface RevenuePoint {
    month: string;
    revenue: number;
    costs: number;
    profit: number;
}

export type ClientStatus = "Healthy" | "At Risk" | "Churning";

export interface Client {
    id: string;
    name: string;
    mrr: number;
    margin: number;
    status: ClientStatus;
    primaryTech: string;
    lastReviewDate?: string;
}

export type ConsultantStatus = "Overutilized" | "Optimal" | "Benched";

export interface Consultant {
    id: string;
    name: string;
    role: string;
    utilization: number;
    billableRate: number;
    status: ConsultantStatus;
}

export interface ForecastPoint {
    month: string;
    baseRevenue: number;
    weightedPipeline: number;
}

export const executiveDashboardData = {
    kpis: {
        mrr: 142500,
        ytdRevenue: 1250000,
        averageMargin: 42.5,
        activeClients: 12,
        consultantUtilization: 82,
    } as KPI,
    revenueTrend: [
        { month: "Jan", revenue: 125000, costs: 75000, profit: 50000 },
        { month: "Feb", revenue: 130000, costs: 76000, profit: 54000 },
        { month: "Mar", revenue: 138000, costs: 80000, profit: 58000 },
        { month: "Apr", revenue: 140000, costs: 81000, profit: 59000 },
        { month: "May", revenue: 142500, costs: 82000, profit: 60500 },
    ] as RevenuePoint[],
    topClients: [
        {
            id: "c-1",
            name: "Acme Corp Logistics",
            mrr: 45000,
            margin: 48,
            status: "Healthy",
            primaryTech: "AWS / React",
        },
        {
            id: "c-2",
            name: "Global Finance Partners",
            mrr: 32000,
            margin: 35,
            status: "At Risk",
            primaryTech: "Azure / .NET",
        },
        {
            id: "c-3",
            name: "Nexus Health Systems",
            mrr: 28500,
            margin: 45,
            status: "Healthy",
            primaryTech: "GCP / Python",
        },
        {
            id: "c-4",
            name: "Starlight Retail",
            mrr: 15000,
            margin: 22,
            status: "Churning",
            primaryTech: "Shopify / Node",
        },
    ] as Client[],
    revenueByService: [
        { name: "Cloud Migration", value: 65000 },
        { name: "Managed Services", value: 45000 },
        { name: "Custom Dev", value: 32500 },
    ],
    fullClientList: [
        {
            id: "c-1",
            name: "Acme Corp Logistics",
            mrr: 45000,
            margin: 48,
            status: "Healthy",
            primaryTech: "AWS / React",
            lastReviewDate: "Oct 15, 2026",
        },
        {
            id: "c-2",
            name: "Global Finance Partners",
            mrr: 32000,
            margin: 35,
            status: "At Risk",
            primaryTech: "Azure / .NET",
            lastReviewDate: "Oct 12, 2026",
        },
        {
            id: "c-3",
            name: "Nexus Health Systems",
            mrr: 28500,
            margin: 45,
            status: "Healthy",
            primaryTech: "GCP / Python",
            lastReviewDate: "Sep 28, 2026",
        },
        {
            id: "c-4",
            name: "Starlight Retail",
            mrr: 15000,
            margin: 22,
            status: "Churning",
            primaryTech: "Shopify / Node",
            lastReviewDate: "Sep 25, 2026",
        },
        {
            id: "c-5",
            name: "Apex Manufacturing",
            mrr: 12000,
            margin: 41,
            status: "Healthy",
            primaryTech: "AWS / Java",
            lastReviewDate: "Oct 01, 2026",
        },
        {
            id: "c-6",
            name: "Nova Logistics",
            mrr: 8500,
            margin: 38,
            status: "Healthy",
            primaryTech: "Azure / React",
            lastReviewDate: "Oct 09, 2026",
        },
        {
            id: "c-7",
            name: "Zenith Media",
            mrr: 7200,
            margin: 28,
            status: "At Risk",
            primaryTech: "GCP / Node",
            lastReviewDate: "Aug 15, 2026",
        },
        {
            id: "c-8",
            name: "Oasis Software",
            mrr: 14000,
            margin: 44,
            status: "Healthy",
            primaryTech: "AWS / Go",
            lastReviewDate: "Oct 14, 2026",
        },
    ] as Client[],
    consultantsList: [
        { id: "cons-1", name: "Sarah Jenkins", role: "Senior Cloud Architect", utilization: 105, billableRate: 250, status: "Overutilized" },
        { id: "cons-2", name: "Marcus Webb", role: "Lead Data Engineer", utilization: 92, billableRate: 225, status: "Optimal" },
        { id: "cons-3", name: "Priya Patel", role: "Frontend Specialist", utilization: 85, billableRate: 150, status: "Optimal" },
        { id: "cons-4", name: "David Chen", role: "Backend Developer", utilization: 88, billableRate: 150, status: "Optimal" },
        { id: "cons-5", name: "Elena Rodriguez", role: "UX Researcher", utilization: 30, billableRate: 175, status: "Benched" },
        { id: "cons-6", name: "James Wilson", role: "Security Consultant", utilization: 110, billableRate: 275, status: "Overutilized" },
    ] as Consultant[],
    forecastData: [
        { month: "Mar", baseRevenue: 138000, weightedPipeline: 45000 },
        { month: "Apr", baseRevenue: 140000, weightedPipeline: 52000 },
        { month: "May", baseRevenue: 142500, weightedPipeline: 68000 },
    ] as ForecastPoint[],
};

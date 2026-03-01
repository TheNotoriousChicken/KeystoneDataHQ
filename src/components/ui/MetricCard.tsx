import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../utils/cn";
import Card from "./Card";

interface MetricCardProps {
    title: string;
    value: string | number;
    trend: number;
    trendLabel: string;
    isGood: boolean;
    className?: string;
}

export default function MetricCard({
    title,
    value,
    trend,
    trendLabel,
    isGood,
    className,
}: MetricCardProps) {
    const TrendIcon = isGood ? TrendingUp : TrendingDown;
    const trendColorClass = isGood ? "text-emerald-400" : "text-rose-400";

    return (
        <Card className={cn("flex flex-col gap-4", className)}>
            <div className="text-sm font-medium text-text-muted">{title}</div>
            <div className="text-3xl font-semibold text-text-main">{value}</div>
            <div className="flex items-center gap-2 text-sm mt-auto text-text-muted">
                <span className={cn("flex items-center gap-1 font-medium", trendColorClass)}>
                    <TrendIcon className="w-4 h-4" />
                    {Math.abs(trend)}%
                </span>
                <span>{trendLabel}</span>
            </div>
        </Card>
    );
}

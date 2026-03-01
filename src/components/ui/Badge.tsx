import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type BadgeVariant = "success" | "warning" | "danger" | "neutral";

interface BadgeProps {
    variant: BadgeVariant;
    children: ReactNode;
    className?: string;
}

export default function Badge({ variant, children, className }: BadgeProps) {
    const variantStyles = {
        success: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20",
        warning: "bg-amber-400/10 text-amber-400 border border-amber-400/20",
        danger: "bg-rose-400/10 text-rose-400 border border-rose-400/20",
        neutral: "bg-surfaceHover text-text-muted border border-border",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                variantStyles[variant],
                className
            )}
        >
            {children}
        </span>
    );
}

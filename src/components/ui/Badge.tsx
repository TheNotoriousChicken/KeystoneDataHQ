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
        success: "bg-emerald-400/10 text-emerald-400",
        warning: "bg-amber-400/10 text-amber-400",
        danger: "bg-rose-400/10 text-rose-400",
        neutral: "bg-surfaceHover text-text-muted",
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

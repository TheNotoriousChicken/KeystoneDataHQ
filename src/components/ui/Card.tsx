import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface CardProps {
    title?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

export default function Card({ title, action, children, className }: CardProps) {
    return (
        <div className={cn("bg-surface border border-border rounded-2xl p-6", className)}>
            {(title || action) && (
                <div className="flex items-center justify-between mb-6">
                    {title && <h3 className="text-text-main font-semibold text-lg">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div>{children}</div>
        </div>
    );
}

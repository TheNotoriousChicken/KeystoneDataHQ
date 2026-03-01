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
        <div className={cn("bg-surface border border-border rounded-2xl p-6 shadow-glass shadow-inner-light backdrop-blur-xl relative overflow-hidden", className)}>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
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

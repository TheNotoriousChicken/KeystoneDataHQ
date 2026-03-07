// Simple pulsing skeleton block
export function Skeleton({ className }) {
    return (
        <div className={`animate-pulse bg-brand-surface border border-brand-border rounded ${className}`} />
    );
}

// Full Dashboard Skeleton Layout
export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-64 rounded-md" />
                    <Skeleton className="h-4 w-48 rounded-md" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </div>

            {/* Top Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-panel p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 space-y-6">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                </div>
                <div className="glass-panel p-6 space-y-6">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

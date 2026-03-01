import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface Column<T> {
    key: keyof T | string;
    header: string;
    align?: "left" | "right" | "center";
    cell?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    className?: string;
}

export default function DataTable<T>({ columns, data, className }: DataTableProps<T>) {
    return (
        <div className={cn("overflow-x-auto", className)}>
            <table className="w-full text-left border-collapse">
                <thead className="bg-background/50 backdrop-blur-sm">
                    <tr>
                        {columns.map((col, i) => (
                            <th
                                key={String(col.key)}
                                className={cn(
                                    "py-4 px-4 border-b border-border text-text-muted text-xs uppercase tracking-wider font-medium",
                                    col.align === "right" && "text-right",
                                    col.align === "center" && "text-center",
                                    i === 0 && "pl-0",
                                    i === columns.length - 1 && "pr-0"
                                )}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="border-b border-border border-l-2 border-l-transparent hover:bg-surfaceHover/40 hover:border-l-primary transition-all duration-200 last:border-b-0"
                        >
                            {columns.map((col, colIndex) => (
                                <td
                                    key={String(col.key)}
                                    className={cn(
                                        "py-4 px-4 text-sm text-text-main",
                                        col.align === "right" && "text-right",
                                        col.align === "center" && "text-center",
                                        colIndex === 0 && "pl-0",
                                        colIndex === columns.length - 1 && "pr-0"
                                    )}
                                >
                                    {col.cell ? col.cell(row) : (row as any)[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

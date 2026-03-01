import { ChevronDown } from "lucide-react";

export default function Topbar() {
    return (
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-8">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <span className="text-text-main font-medium">NovaEdge IT Consulting</span>
                <ChevronDown className="w-4 h-4 text-text-muted" />
            </div>

            <div className="flex items-center gap-4">
                <button className="w-9 h-9 flex items-center justify-center rounded-full bg-surfaceHover border border-border text-text-main font-medium text-sm hover:ring-2 hover:ring-primary/20 transition-all">
                    NE
                </button>
            </div>
        </header>
    );
}

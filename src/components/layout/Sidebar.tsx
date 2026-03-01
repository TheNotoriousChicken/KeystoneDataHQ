import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    CircleDollarSign,
    Briefcase,
    Users,
    TrendingUp,
    Settings,
} from "lucide-react";

export default function Sidebar() {
    const navItems = [
        { name: "Overview", path: "/", icon: LayoutDashboard },
        { name: "Revenue", path: "/revenue", icon: CircleDollarSign },
        { name: "Clients", path: "/clients", icon: Briefcase },
        { name: "Consultants", path: "/consultants", icon: Users },
        { name: "Forecast", path: "/forecast", icon: TrendingUp },
        { name: "Settings", path: "/settings", icon: Settings },
    ];

    return (
        <aside className="w-64 bg-surface border-r border-border h-full flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary rounded-sm shadow-sm" />
                    <span className="text-text-main font-semibold text-lg tracking-tight">KeystoneDataHQ</span>
                </div>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium text-sm ${isActive
                                ? "bg-primary/10 text-primary"
                                : "text-text-muted hover:text-text-main hover:bg-surfaceHover"
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

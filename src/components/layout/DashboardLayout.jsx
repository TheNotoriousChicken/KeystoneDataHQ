import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Cable, FileText, Settings, CreditCard, LogOut, Database, ChevronDown, Download } from 'lucide-react';
import MobileBlocker from './MobileBlocker';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Integrations', href: '/dashboard/integrations', icon: Cable },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

export default function DashboardLayout() {
    const location = useLocation();

    return (
        <>
            {/* Mobile View */}
            <div className="flex flex-col lg:hidden min-h-screen bg-brand-bg pt-20">
                <header className="h-20 border-b border-brand-border bg-brand-bg/95 backdrop-blur-sm fixed top-0 w-full z-50 flex items-center px-6">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                            <Database className="w-5 h-5 text-brand-primary" />
                        </div>
                        <span className="font-bold tracking-tight text-white text-xl">Keystone</span>
                    </Link>
                </header>
                <div className="flex-1 flex flex-col justify-center">
                    <MobileBlocker />
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:flex min-h-screen bg-brand-bg w-full">
                {/* Sidebar */}
                <aside className="w-64 border-r border-brand-border bg-brand-surface/30 flex flex-col fixed inset-y-0 left-0 z-40">
                    <div className="h-20 flex items-center px-6 border-b border-brand-border">
                        <Link to="/dashboard" className="flex items-center gap-2 group">
                            <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                                <Database className="w-5 h-5 text-brand-primary" />
                            </div>
                            <span className="font-bold tracking-tight">Keystone</span>
                        </Link>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-colors ${isActive
                                        ? 'bg-brand-primary/10 text-brand-primary'
                                        : 'text-brand-muted hover:bg-brand-surface hover:text-white'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-brand-border">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-[8px] glass-panel mb-2">
                            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-sm">
                                JD
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">John Doe</p>
                                <p className="text-xs text-brand-muted truncate">john@acmecorp.com</p>
                            </div>
                        </div>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-brand-muted hover:text-white hover:bg-brand-surface transition-colors">
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 pl-64 flex flex-col min-h-screen">
                    {/* Topbar */}
                    <header className="h-20 border-b border-brand-border bg-brand-bg/95 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-8">
                        <div>
                            <h1 className="text-xl font-bold text-white">Acme Corp Analytics</h1>
                            <p className="text-xs text-brand-secondary flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse"></span>
                                Live Data Sync Active
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="glass-panel px-4 py-2 flex items-center gap-2 cursor-pointer hover:border-brand-primary transition-colors text-sm">
                                <span className="text-brand-muted text-xs">Date Range:</span>
                                <span className="font-medium">Last 30 Days</span>
                                <ChevronDown className="w-4 h-4 text-brand-muted" />
                            </div>
                            <button className="bg-brand-surface border border-brand-border hover:border-brand-primary text-white font-medium px-4 py-2 rounded-[8px] transition-colors flex items-center gap-2 text-sm shadow-sm">
                                <Download className="w-4 h-4" />
                                Export PDF
                            </button>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="p-8 flex-1">
                        <Outlet />
                    </div>
                </main>
            </div>
        </>
    );
}

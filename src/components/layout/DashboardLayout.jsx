import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Cable, FileText, Settings, CreditCard, LogOut, Database, ChevronDown, Download, Users, Activity as ActivityIcon, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFlags } from '../../context/FlagContext';
import MobileBlocker from './MobileBlocker';
import NotificationDropdown from './NotificationDropdown';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Integrations', href: '/dashboard/integrations', icon: Cable },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Founder HQ', href: '/dashboard/founder-hq', icon: Crown, superAdminOnly: true },
    { name: 'Team', href: '/dashboard/team', icon: Users, adminOnly: true },
    { name: 'Activity', href: '/dashboard/activity', icon: ActivityIcon, adminOnly: true },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, adminOnly: true },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard, adminOnly: true },
];

export default function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, stopImpersonating } = useAuth();
    const { isFeatureEnabled } = useFlags();

    const [broadcast, setBroadcast] = useState(null);
    const isImpersonating = !!localStorage.getItem('kd_super_admin_token');

    // Fetch active global broadcast
    useEffect(() => {
        const fetchBroadcast = async () => {
            try {
<<<<<<< HEAD
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/broadcast/active`);
=======
                const res = await fetch('http://localhost:4000/api/broadcast/active');
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                if (res.ok) {
                    const data = await res.json();
                    setBroadcast(data.broadcast);
                }
            } catch (err) {
                console.error('Failed to fetch broadcast', err);
            }
        };
        fetchBroadcast();
    }, []);

    const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : '??';
    const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';
    const companyName = user?.company?.name || 'Company';
    const isAdmin = user?.role === 'ADMIN';
    const isSuperAdmin = user?.isSuperAdmin === true;

    // Filter nav items by role dynamically
    const visibleNav = navigation.filter(item => {
        if (item.superAdminOnly && !isSuperAdmin) return false;
        if (item.superAdminOnly && isSuperAdmin) return true;
        if (item.adminOnly && !isAdmin) return false;

        // Feature flag protections
        if (item.name === 'Integrations' && !isFeatureEnabled('enable_integrations')) return false;

        return true;
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Global Broadcast Banner */}
            {broadcast && !isImpersonating && (
                <div className={`fixed top-0 left-0 right-0 z-[100] px-4 py-2 flex items-center justify-center gap-4 backdrop-blur-md shadow-sm border-b
                    ${broadcast.type === 'CRITICAL' ? 'bg-red-600/90 border-red-500 text-white' :
                        broadcast.type === 'WARNING' ? 'bg-amber-500/90 border-amber-400 text-amber-950' :
                            'bg-brand-primary/90 border-brand-primary text-white'}`}
                >
                    <span className="text-sm font-bold flex items-center gap-2">
                        {broadcast.type === 'CRITICAL' ? '🚨' : broadcast.type === 'WARNING' ? '⚠️' : '📢'}
                        {broadcast.message}
                    </span>
                    <button
                        onClick={() => setBroadcast(null)}
                        className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                        ✕
                    </button>
                </div>
            )}

            {isImpersonating && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600/90 border-b border-red-500 text-white px-4 py-2 flex items-center justify-center gap-4 backdrop-blur-md">
                    <span className="text-sm font-bold flex items-center gap-2">
                        ⚠️ GOD MODE ACTIVE: You are currently viewing the app as {user?.email}
                    </span>
                    <button
                        onClick={() => { stopImpersonating(); navigate('/dashboard/founder-hq'); }}
                        className="px-3 py-1 bg-white text-red-600 rounded text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        End Impersonation
                    </button>
                </div>
            )}

            {/* Mobile View */}
            <div className={`flex flex-col lg:hidden min-h-screen bg-brand-bg pt-20 ${isImpersonating || broadcast ? 'mt-[40px]' : ''}`}>
                <header className="h-20 border-b border-brand-border bg-brand-bg/95 backdrop-blur-sm fixed top-0 w-full z-50 flex items-center px-6">
                    <Link to="/" className="flex items-center gap-2">
                        {user?.company?.logoUrl ? (
<<<<<<< HEAD
                            <img src={`${import.meta.env.VITE_API_URL}${user.company.logoUrl}`} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-brand-surface border border-brand-border" />
=======
                            <img src={`http://localhost:4000${user.company.logoUrl}`} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-brand-surface border border-brand-border" />
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                        ) : (
                            <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                                <Database className="w-5 h-5 text-brand-primary" />
                            </div>
                        )}
                        <span className="font-bold tracking-tight text-white text-xl">Keystone</span>
                    </Link>
                </header>
                <div className="flex-1 flex flex-col justify-center">
                    <MobileBlocker />
                </div>
            </div>

            {/* Desktop View */}
            <div className={`hidden lg:flex min-h-screen bg-brand-bg w-full ${isImpersonating || broadcast ? 'pt-[40px]' : ''}`}>
                {/* Sidebar */}
                <aside className={`w-64 border-r border-brand-border bg-brand-surface/30 flex flex-col fixed inset-y-0 left-0 z-40 ${isImpersonating || broadcast ? 'top-[40px]' : ''}`}>
                    <div className="h-20 flex items-center px-6 border-b border-brand-border">
                        <Link to="/dashboard" className="flex items-center gap-2 group">
                            {user?.company?.logoUrl ? (
<<<<<<< HEAD
                                <img src={`${import.meta.env.VITE_API_URL}${user.company.logoUrl}`} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-brand-surface border border-brand-border" />
=======
                                <img src={`http://localhost:4000${user.company.logoUrl}`} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-brand-surface border border-brand-border" />
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                            ) : (
                                <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                                    <Database className="w-5 h-5 text-brand-primary" />
                                </div>
                            )}
                            <span className="font-bold tracking-tight text-white">{user?.company?.name || 'Keystone'}</span>
                        </Link>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        {visibleNav.map((item) => {
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
                        <Link to="/dashboard/profile" className="flex items-center gap-3 px-3 py-3 rounded-[8px] glass-panel mb-2 hover:border-brand-primary transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex flex-shrink-0 items-center justify-center text-brand-primary font-bold text-sm group-hover:bg-brand-primary group-hover:text-white transition-colors overflow-hidden border border-brand-primary/30">
                                {user?.avatarUrl ? (
<<<<<<< HEAD
                                    <img src={`${import.meta.env.VITE_API_URL}${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
=======
                                    <img src={`http://localhost:4000${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                                ) : (
                                    initials
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-white truncate">{fullName}</p>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isAdmin ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-surface text-brand-muted'}`}>
                                        {user?.role || 'VIEWER'}
                                    </span>
                                </div>
                                <p className="text-xs text-brand-muted truncate hover:text-white transition-colors">Manage profile →</p>
                            </div>
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-brand-muted hover:text-white hover:bg-brand-surface transition-colors">
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
                            <h1 className="text-xl font-bold text-white">{companyName} Analytics</h1>
                            <p className="text-xs text-brand-secondary flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse"></span>
                                Live Data Sync Active
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
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

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Search, Mail, Shield, Building2, Calendar, ShieldAlert, KeyRound, UserCog } from 'lucide-react';
import { format } from 'date-fns';

export default function UserDirectory() {
    const { token } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const queryClient = useQueryClient();

    const { data: users, isLoading, isError } = useQuery({
        queryKey: ['superAdminUsers'],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
        }
    });

    const filteredUsers = users?.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleResetPassword = async (userId, email) => {
        if (!confirm(`Send password reset link to ${email}?`)) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to send reset email');
            alert(`Password reset email sent to ${email}`);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleToggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'ADMIN' ? 'VIEWER' : 'ADMIN';
        if (!confirm(`Change user role from ${currentRole} to ${newRole}?`)) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to change role');
            queryClient.invalidateQueries(['superAdminUsers']);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">User Directory</h1>
                    <p className="text-brand-muted text-sm">Manage global users across all companies.</p>
                </div>
                <div className="relative w-72">
                    <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-brand-surface border border-brand-border rounded-md text-sm text-white focus:border-brand-primary outline-none"
                    />
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-brand-border bg-brand-surface/30">
                                <th className="p-4 text-xs font-medium text-brand-muted uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-medium text-brand-muted uppercase tracking-wider">Company</th>
                                <th className="p-4 text-xs font-medium text-brand-muted uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-medium text-brand-muted uppercase tracking-wider">Joined</th>
                                <th className="p-4 text-xs font-medium text-brand-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-brand-muted flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                                        Loading users...
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-rose-400">Failed to load users.</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-brand-muted">No users found matching "{searchTerm}".</td>
                                </tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-brand-surface/20 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-xs">
                                                    {u.firstName[0]}{u.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white flex items-center gap-1.5">
                                                        {u.firstName} {u.lastName}
                                                        {u.isSuperAdmin && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" title="Super Admin" />}
                                                    </p>
                                                    <p className="text-xs text-brand-muted flex items-center gap-1 mt-0.5">
                                                        <Mail className="w-3 h-3" /> {u.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-white flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5 text-brand-muted" />
                                                    {u.companyName}
                                                </span>
                                                <span className={`text-[10px] w-fit px-1.5 py-0.5 rounded-full mt-1 border ${
                                                    u.companyTier === 'GROWTH' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                                                    u.companyTier === 'STARTER' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    'bg-brand-surface text-brand-muted border-brand-border'
                                                }`}>
                                                    {u.companyTier}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1.5 w-fit ${
                                                u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-400' : 'bg-brand-surface text-brand-muted'
                                            }`}>
                                                <Shield className="w-3 h-3" />
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-brand-muted flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(u.createdAt), 'MMM d, yyyy')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    title="Force Password Reset"
                                                    onClick={() => handleResetPassword(u.id, u.email)}
                                                    className="p-1.5 text-brand-muted hover:text-white bg-brand-surface border border-brand-border rounded hover:border-brand-primary transition-colors"
                                                >
                                                    <KeyRound className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    title={u.role === 'ADMIN' ? 'Demote to VIEWER' : 'Promote to ADMIN'}
                                                    onClick={() => handleToggleRole(u.id, u.role)}
                                                    className="p-1.5 text-brand-muted hover:text-white bg-brand-surface border border-brand-border rounded hover:border-brand-primary transition-colors"
                                                >
                                                    <UserCog className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

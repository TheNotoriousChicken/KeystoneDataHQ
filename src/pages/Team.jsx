import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Mail, UserPlus, Clock, Shield, CheckCircle2 } from 'lucide-react';

export default function Team() {
    const { token, user: currentUser } = useAuth();

    const [teamMembers, setTeamMembers] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [inviteEmail, setInviteEmail] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState('');
    const [error, setError] = useState(null);

    // Initial fetch
    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            setIsLoading(true);
            setError(null);
<<<<<<< HEAD
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/team`, {
=======
            const res = await fetch('http://localhost:4000/api/team', {
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch team members.');

            setTeamMembers(data.members || []);
            setPendingInvites(data.pendingInvites || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();

        if (!inviteEmail) return;

        try {
            setIsInviting(true);
            setError(null);
            setInviteSuccess('');

<<<<<<< HEAD
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/team/invite`, {
=======
            const res = await fetch('http://localhost:4000/api/team/invite', {
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: inviteEmail })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to send invite.');

            setInviteSuccess(`Invitation link ready: ${data.inviteLink}`);
            setInviteEmail('');

            // Refresh the list to show the new pending invite
            fetchTeam();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Users className="w-6 h-6 text-brand-primary" />
                    Team Management
                </h2>
                <p className="text-brand-muted text-sm mt-1">
                    Manage your team members and send invitations to collaborate on your workspace.
                </p>
            </div>

            {/* Error & Success States */}
            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    {error}
                </div>
            )}

            {inviteSuccess && (
                <div className="p-4 rounded-lg bg-brand-secondary/10 border border-brand-secondary/20 text-sm">
                    <p className="text-brand-secondary font-medium mb-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Invitation Created Successfully
                    </p>
                    <div className="flex items-center gap-3">
                        <code className="text-xs bg-brand-surface px-2 py-1 rounded text-white overflow-x-auto whitespace-nowrap flex-1 border border-brand-border">
                            {inviteSuccess.replace('Invitation link ready: ', '')}
                        </code>
                        <button
                            onClick={() => navigator.clipboard.writeText(inviteSuccess.replace('Invitation link ready: ', ''))}
                            className="text-brand-primary hover:text-white text-xs font-semibold px-2 py-1 bg-brand-primary/10 hover:bg-brand-primary rounded transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Col - Team List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel">
                        <div className="px-6 py-5 border-b border-brand-border flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Active Members</h3>
                            <span className="text-xs font-medium bg-brand-surface px-2.5 py-1 rounded-full text-brand-muted border border-brand-border">
                                {teamMembers.length} Users
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="p-12 text-center text-brand-muted">Loading team members...</div>
                        ) : (
                            <div className="divide-y divide-brand-border">
                                {teamMembers.map(member => (
                                    <div key={member.id} className="p-6 flex items-center justify-between hover:bg-brand-surface/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-primary font-bold shadow-inner">
                                                {member.firstName[0]}{member.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {member.firstName} {member.lastName}
                                                    {member.id === currentUser.id && (
                                                        <span className="ml-2 text-[10px] uppercase tracking-wider bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded font-bold">You</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-brand-muted">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {member.role === 'ADMIN' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                    <Shield className="w-3 h-3" /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-surface text-brand-muted border border-brand-border">
                                                    Viewer
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Invites */}
                    {pendingInvites.length > 0 && (
                        <div className="glass-panel">
                            <div className="px-6 py-5 border-b border-brand-border">
                                <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Pending Invitations
                                </h3>
                            </div>
                            <div className="divide-y divide-brand-border">
                                {pendingInvites.map(invite => (
                                    <div key={invite.id} className="p-4 px-6 flex items-center justify-between bg-brand-surface/10">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-brand-muted" />
                                            <p className="text-sm text-brand-muted">{invite.email}</p>
                                        </div>
                                        <span className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                                            Pending
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Col - Invite Form */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-6 sticky top-28">
                        <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-4">
                            <UserPlus className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Invite Colleague</h3>
                        <p className="text-sm text-brand-muted mb-6 leading-relaxed">
                            Send an invitation to a team member. They will join as a Viewer and can see your unified dashboard.
                        </p>

                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-brand-muted mb-1.5 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="colleague@company.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isInviting || !inviteEmail}
                                className="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isInviting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        Generate Invite Link
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}

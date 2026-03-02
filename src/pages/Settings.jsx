import { useState } from 'react';
import { User, Mail, Building, Key, Plus, Shield, UserCog } from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Organization Settings</h2>
                <p className="text-brand-muted mt-2">Manage your personal profile and team access.</p>
            </div>

            <div className="flex border-b border-brand-border gap-8">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'profile' ? 'text-brand-primary' : 'text-brand-muted hover:text-white'
                        }`}
                >
                    Profile
                    {activeTab === 'profile' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'team' ? 'text-brand-primary' : 'text-brand-muted hover:text-white'
                        }`}
                >
                    Team Members
                    {activeTab === 'team' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full" />
                    )}
                </button>
            </div>

            {activeTab === 'profile' && (
                <div className="space-y-6">
                    <div className="glass-panel p-8 border-brand-border/50">
                        <h3 className="text-lg font-bold text-white mb-6">Personal Information</h3>
                        <form className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-brand-muted mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="w-5 h-5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="text" defaultValue="John Doe" className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-[8px] text-white focus:outline-none focus:border-brand-primary" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-muted mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="w-5 h-5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="email" defaultValue="john@acmecorp.com" className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-[8px] text-white focus:outline-none focus:border-brand-primary" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-2">Company Name</label>
                                <div className="relative">
                                    <Building className="w-5 h-5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input type="text" defaultValue="Acme Corp" className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-[8px] text-white focus:outline-none focus:border-brand-primary" />
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="button" className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-2 rounded-[8px] font-medium transition-colors shadow-lg shadow-brand-primary/20">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="glass-panel p-8 border-brand-border/50">
                        <h3 className="text-lg font-bold text-white mb-6">Change Password</h3>
                        <form className="space-y-6 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-2">Current Password</label>
                                <div className="relative">
                                    <Key className="w-5 h-5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-[8px] text-white focus:outline-none focus:border-brand-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-2">New Password</label>
                                <div className="relative">
                                    <Key className="w-5 h-5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-[8px] text-white focus:outline-none focus:border-brand-primary" />
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="button" className="bg-brand-surface border border-brand-border hover:border-brand-primary text-white px-6 py-2 rounded-[8px] font-medium transition-colors">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'team' && (
                <div className="space-y-6">
                    <div className="glass-panel p-8 border-brand-border/50">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white">Team Members</h3>
                                <p className="text-sm text-brand-muted mt-1">Manage who has access to your workspace.</p>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    className="px-4 py-2 bg-brand-surface border border-brand-border rounded-[8px] text-sm text-white focus:outline-none focus:border-brand-primary w-64"
                                />
                                <button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-[8px] font-medium transition-colors flex items-center gap-2 text-sm shadow-md shadow-brand-primary/20">
                                    <Plus className="w-4 h-4" />
                                    Invite Member
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: 'John Doe', email: 'john@acmecorp.com', role: 'Admin', icon: Shield },
                                { name: 'Sarah Smith', email: 'sarah@acmecorp.com', role: 'Viewer', icon: UserCog },
                                { name: 'Mike Ross', email: 'mike@acmecorp.com', role: 'Viewer', icon: UserCog }
                            ].map((member, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-brand-surface/30 border border-brand-border rounded-[8px]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 text-brand-primary font-bold">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{member.name}</p>
                                            <p className="text-xs text-brand-muted">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-surface border border-brand-border rounded-full text-xs font-medium text-brand-muted">
                                            <member.icon className="w-3.5 h-3.5" />
                                            {member.role}
                                        </div>
                                        {member.role !== 'Admin' && (
                                            <button className="text-sm text-rose-500 hover:text-rose-400 font-medium transition-colors">
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

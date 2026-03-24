import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { authorizedFetch } from '../utils/authRefresh';

/**
 * useAdminDashboard — Centralized hook for fetching all SuperAdmin
 * dashboard data (stats, companies, revenue, health, signups).
 * Uses authorizedFetch for automatic token refresh on 401.
 */
export function useAdminDashboard() {
    const { user } = useAuth();
    const API = import.meta.env.VITE_API_URL;

    const { data: adminData, isLoading, isError, error } = useQuery({
        queryKey: ['adminDashboard'],
        queryFn: async () => {
            const endpoints = [
                'stats', 'companies', 'revenue',
                'integrations-health', 'signups'
            ];
            const responses = await Promise.all(
                endpoints.map(ep => authorizedFetch(`${API}/api/admin/${ep}`))
            );

            const failed = responses.find(r => !r.ok);
            if (failed) throw new Error('Failed to fetch admin data.');

            const [stats, companies, revenue, health, signups] =
                await Promise.all(responses.map(r => r.json()));

            return { stats, companies, revenue, health, signups };
        },
        enabled: !!user && user.isSuperAdmin === true,
    });

    return { adminData, isLoading, isError, error };
}

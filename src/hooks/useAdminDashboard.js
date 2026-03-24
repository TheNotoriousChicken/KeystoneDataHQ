import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { authorizedFetch } from '../utils/authRefresh';

/**
 * useAdminDashboard — Fetches all SuperAdmin dashboard data in a single
 * consolidated request to /api/admin/dashboard.
 */
export function useAdminDashboard() {
    const { user } = useAuth();
    const API = import.meta.env.VITE_API_URL;

    const { data: adminData, isLoading, isError, error } = useQuery({
        queryKey: ['adminDashboard'],
        queryFn: async () => {
            const res = await authorizedFetch(`${API}/api/admin/dashboard`);
            if (!res.ok) throw new Error('Failed to fetch admin data.');
            return res.json();
        },
        enabled: !!user && user.isSuperAdmin === true,
    });

    return { adminData, isLoading, isError, error };
}

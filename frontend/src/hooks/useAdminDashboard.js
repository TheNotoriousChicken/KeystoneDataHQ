import { useQuery } from '@tanstack/react-query';

export function useAdminDashboard() {
  const API = import.meta.env.VITE_API_URL;
  // Assume auth token is provided by a separate auth context on the frontend
  // If you have a global auth hook, pass token in or pull from context here.
  // For simplicity, this hook expects the token to be stored in local storage.
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const endpoints = ['stats', 'companies', 'revenue', 'integrations-health', 'signups'];
      const responses = await Promise.all(endpoints.map(ep => fetch(`${API}/api/admin/${ep}`, { headers })));
      const failed = responses.find(r => !r.ok);
      if (failed) throw new Error('Failed to fetch admin data.');
      const dataArr = await Promise.all(responses.map(r => r.json()));
      const [stats, companies, revenue, health, signups] = dataArr;
      return { stats, companies, revenue, health, signups };
    },
    enabled: !!token,
  });

  return { adminData: data, isLoading, isError, error };
}

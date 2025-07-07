import { useQuery } from "@tanstack/react-query";

export function useAdminAuth() {
  const { data: admin, isLoading, error } = useQuery({
    queryKey: ["/api/admin/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    admin,
    isLoading,
    isAuthenticated: !!admin && !error,
    error,
  };
}
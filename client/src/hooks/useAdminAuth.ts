import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAdminAuth() {
  const { data: admin, isLoading, error } = useQuery({
    queryKey: ["/api/admin/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    admin,
    isLoading,
    isAuthenticated: !!admin && !error,
    error,
  };
}
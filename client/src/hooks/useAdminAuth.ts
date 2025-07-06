import { useQuery } from "@tanstack/react-query";

export function useAdminAuth() {
  const { data: admin, isLoading } = useQuery({
    queryKey: ["/api/admin/auth/user"],
    retry: false,
  });

  return {
    admin,
    isLoading,
    isAuthenticated: !!admin,
  };
}
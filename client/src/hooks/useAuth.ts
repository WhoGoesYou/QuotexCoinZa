import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const [demoUser, setDemoUser] = useState(null);
  const [isCheckingDemo, setIsCheckingDemo] = useState(true);

  // Check for demo user in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('demoUser');
    if (storedUser) {
      try {
        setDemoUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('demoUser');
      }
    }
    setIsCheckingDemo(false);
  }, []);

  const { data: user, isLoading: isApiLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !demoUser, // Only try API if no demo user
  });

  const finalUser = demoUser || user;
  const isLoading = isCheckingDemo || (isApiLoading && !demoUser);

  return {
    user: finalUser,
    isLoading,
    isAuthenticated: !!finalUser,
  };
}

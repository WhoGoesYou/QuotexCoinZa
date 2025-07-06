import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Trading from "@/pages/trading";
import Admin from "@/pages/admin";
import AdminLoginPage from "@/pages/admin-login";
import Navbar from "@/components/navbar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAuthenticated: isAdminAuthenticated, isLoading: isAdminLoading } = useAdminAuth();

  if (isLoading && isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading QUOTEX COIN WALLETS...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Admin routes - separate from regular user routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      
      {isAdminAuthenticated ? (
        <Route path="/admin" component={Admin} />
      ) : (
        /* Regular user routes */
        <>
          {!isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Navbar />
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/trading" component={Trading} />
            </>
          )}
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

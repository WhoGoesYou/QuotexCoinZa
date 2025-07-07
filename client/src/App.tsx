import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Trading from "@/pages/trading";
import Admin from "@/pages/admin";
import AdminLoginPage from "@/pages/admin-login";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import RiskDisclosure from "@/pages/risk-disclosure";
import Compliance from "@/pages/compliance";
import Navbar from "@/components/navbar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAuthenticated: isAdminAuthenticated, isLoading: isAdminLoading } = useAdminAuth();

  if (isLoading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-white">Loading QUOTEX COIN WALLETS...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/risk-disclosure" component={RiskDisclosure} />
      <Route path="/compliance" component={Compliance} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={Admin} />
      
      {/* Protected user routes */}
      <Route path="/dashboard">
        {isAuthenticated ? (
          <>
            <Navbar />
            <Dashboard />
          </>
        ) : (
          <Login />
        )}
      </Route>
      
      <Route path="/trading">
        {isAuthenticated ? (
          <>
            <Navbar />
            <Trading />
          </>
        ) : (
          <Login />
        )}
      </Route>
      
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

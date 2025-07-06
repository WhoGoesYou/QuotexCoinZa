import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Form schemas
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthForms() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("login");

  // Login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Register form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegister,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      country: "South Africa",
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return await response.json();
    },
    onSuccess: (response: any) => {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.username}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      resetLogin();
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return await response.json();
    },
    onSuccess: (response: any) => {
      toast({
        title: "Registration Successful",
        description: `Welcome to QUOTEX COIN WALLETS, ${response.user.username}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      resetRegister();
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
            QUOTEX COIN WALLETS
          </CardTitle>
          <CardDescription>
            Your gateway to digital wealth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    {...loginRegister("username")}
                    placeholder="Enter your username"
                  />
                  {loginErrors.username && (
                    <p className="text-sm text-red-500">{loginErrors.username.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    {...loginRegister("password")}
                    placeholder="Enter your password"
                  />
                  {loginErrors.password && (
                    <p className="text-sm text-red-500">{loginErrors.password.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-firstName">First Name</Label>
                    <Input
                      id="register-firstName"
                      {...registerRegister("firstName")}
                      placeholder="First name"
                    />
                    {registerErrors.firstName && (
                      <p className="text-sm text-red-500">{registerErrors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-lastName">Last Name</Label>
                    <Input
                      id="register-lastName"
                      {...registerRegister("lastName")}
                      placeholder="Last name"
                    />
                    {registerErrors.lastName && (
                      <p className="text-sm text-red-500">{registerErrors.lastName.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    {...registerRegister("username")}
                    placeholder="Choose a username"
                  />
                  {registerErrors.username && (
                    <p className="text-sm text-red-500">{registerErrors.username.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    {...registerRegister("email")}
                    placeholder="your@email.com"
                  />
                  {registerErrors.email && (
                    <p className="text-sm text-red-500">{registerErrors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    {...registerRegister("password")}
                    placeholder="Create a password"
                  />
                  {registerErrors.password && (
                    <p className="text-sm text-red-500">{registerErrors.password.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-country">Country</Label>
                    <Input
                      id="register-country"
                      {...registerRegister("country")}
                      placeholder="Country"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-city">City</Label>
                    <Input
                      id="register-city"
                      {...registerRegister("city")}
                      placeholder="City"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
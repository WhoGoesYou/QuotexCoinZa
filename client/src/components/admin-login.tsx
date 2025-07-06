import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Lock } from "lucide-react";

// Admin login schema
const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Admin login form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  // Admin login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: AdminLoginFormData) => {
      const response = await apiRequest("POST", "/api/admin/auth/login", data);
      return await response.json();
    },
    onSuccess: (response: any) => {
      toast({
        title: "Admin Login Successful",
        description: `Welcome back, ${response.admin.username}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auth/user"] });
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Admin Login Failed",
        description: error.message || "Invalid admin credentials",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdminLoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <Shield className="text-white w-6 h-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Admin Portal
          </CardTitle>
          <CardDescription>
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              Restricted Access Only
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">Admin Username</Label>
              <Input
                id="admin-username"
                {...register("username")}
                placeholder="Enter admin username"
                className="border-red-200 focus:border-red-400"
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password</Label>
              <Input
                id="admin-password"
                type="password"
                {...register("password")}
                placeholder="Enter admin password"
                className="border-red-200 focus:border-red-400"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Admin Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <strong>Default Admin Credentials:</strong><br/>
              Username: admin<br/>
              Password: admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
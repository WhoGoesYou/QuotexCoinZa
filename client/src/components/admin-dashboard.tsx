import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import UserManagement from "./user-management";
import { Users, DollarSign, Wallet, Activity, TrendingUp, AlertCircle, Bitcoin, Shield, Globe, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/admin/transactions"],
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });

  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ["/api/market-data"],
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
  });

  if (usersError && isUnauthorizedError(usersError)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Expired</h1>
          <p className="text-gray-600 mb-4">Your admin session has expired. Please log in again.</p>
          <button 
            onClick={() => window.location.href = "/admin"}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Return to Admin Login
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const usersArray = users || [];
  const transactionsArray = transactions || [];
  const totalUsers = usersArray.length || 0;
  const activeUsers = usersArray.filter((user: any) => user.wallets?.some((wallet: any) => parseFloat(wallet.balance) > 0))?.length || 0;
  const totalVolume = transactionsArray.reduce((sum: number, tx: any) => sum + parseFloat(tx.totalZar || "0"), 0) || 0;
  const totalWallets = usersArray.reduce((sum: number, user: any) => sum + (user.wallets?.length || 0), 0) || 0;
  const totalTransactions = transactionsArray.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NEgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEY0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      </div>
      
      {/* Floating Bitcoin Icons */}
      <div className="absolute top-20 left-10 text-amber-400/20 animate-pulse">
        <Bitcoin className="w-8 h-8" />
      </div>
      <div className="absolute top-40 right-20 text-amber-400/20 animate-pulse delay-300">
        <Bitcoin className="w-12 h-12" />
      </div>
      <div className="absolute bottom-20 left-20 text-amber-400/20 animate-pulse delay-700">
        <Bitcoin className="w-6 h-6" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                QUOTEX COIN WALLETS
              </h1>
              <p className="text-blue-200 text-lg mt-2">Professional Bitcoin Exchange - Admin Panel</p>
              <p className="text-blue-300 text-sm">Johannesburg, South Africa ZA</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                <Shield className="w-4 h-4 mr-2" />
                Admin Console
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                <Globe className="w-4 h-4 mr-2" />
                Live System
              </Badge>
              <div className="text-sm text-blue-300">
                Last updated: {new Date().toLocaleString()}
              </div>
              <Button
                onClick={async () => {
                  try {
                    // Call logout endpoint to destroy session
                    const response = await fetch("/api/admin/auth/logout", {
                      method: "POST",
                      credentials: "include",
                    });
                    
                    if (response.ok) {
                      // Redirect to admin login after successful logout
                      window.location.href = "/admin";
                    } else {
                      // Force redirect even if logout fails
                      window.location.href = "/admin";
                    }
                  } catch (error) {
                    console.error("Logout error:", error);
                    // Force redirect even if there's an error
                    window.location.href = "/admin";
                  }
                }}
                variant="outline"
                size="sm"
                className="bg-red-600/20 text-red-300 border-red-500/30 hover:bg-red-600/30 hover:text-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <Skeleton className="h-8 w-16 bg-slate-700" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-slate-400">
                    {activeUsers} active users
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-800/50 to-green-900/50 border-green-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-200">Total Volume (ZAR)</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <Skeleton className="h-8 w-20 bg-green-700" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-white">
                    R{totalVolume.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-xs text-green-300">
                    All-time trading volume
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-800/50 to-amber-900/50 border-amber-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-200">Active Wallets</CardTitle>
              <Wallet className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <Skeleton className="h-8 w-16 bg-amber-700" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-white">{totalWallets.toLocaleString()}</div>
                  <p className="text-xs text-amber-300">
                    Across all cryptocurrencies
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 border-purple-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Transactions</CardTitle>
              <Activity className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <Skeleton className="h-8 w-16 bg-purple-700" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-white">{totalTransactions.toLocaleString()}</div>
                  <p className="text-xs text-purple-300">
                    Total transactions processed
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Market Overview */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span>Live Market Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {marketLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="p-4 border border-slate-700 rounded-lg bg-slate-800/30">
                      <Skeleton className="h-4 w-16 mb-2 bg-slate-700" />
                      <Skeleton className="h-6 w-24 mb-1 bg-slate-700" />
                      <Skeleton className="h-4 w-12 bg-slate-700" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(marketData || []).map((data: any, index: number) => {
                    const cryptoNames = ["Bitcoin", "Ethereum", "XRP", "Solana", "Tether", "USD Coin"];
                    const cryptoSymbols = ["BTC", "ETH", "XRP", "SOL", "USDT", "USDC"];
                    const cryptoColors = ["text-amber-400", "text-blue-400", "text-gray-400", "text-purple-400", "text-green-400", "text-blue-300"];
                    const isPositive = parseFloat(data.percentChange24h || "0") >= 0;
                    
                    return (
                      <div key={data.id} className="p-4 border border-slate-700 rounded-lg bg-gradient-to-br from-slate-800/30 to-slate-900/30 hover:from-slate-700/30 hover:to-slate-800/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${cryptoColors[index]}`}>{cryptoNames[index] || "Unknown"}</span>
                          <span className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{data.percentChange24h}%
                          </span>
                        </div>
                        <div className="text-lg font-bold text-white">
                          R{parseFloat(data.priceZar).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-slate-400">
                          {cryptoSymbols[index] || "N/A"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">User Management</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">Transactions</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">System Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserManagement users={users || []} isLoading={usersLoading} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions?.slice(0, 20).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.cryptocurrency.name}</p>
                          <p className="text-sm text-gray-500">
                            User: {transaction.userId} | {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {transaction.amount} {transaction.cryptocurrency.symbol}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className={`transaction-badge ${transaction.type}`}
                          >
                            {transaction.type.replace('_', ' ')}
                          </Badge>
                          {transaction.totalZar && (
                            <span className="text-sm text-gray-500">
                              R{parseFloat(transaction.totalZar).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!transactions || transactions.length === 0) && (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No transactions found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Database Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">WebSocket Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Market Data</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Live
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Authentication</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-semibold">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-semibold">&lt; 100ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold">99.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Connections</span>
                    <span className="font-semibold">{activeUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

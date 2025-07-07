import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Activity, Wallet, TrendingUp, User, CreditCard } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import WalletBalance from "@/components/wallet-balance";
import TransactionHistory from "@/components/transaction-history";
import { isUnauthorizedError } from "@/lib/authUtils";
import { websocketService } from "@/services/websocket";
import CryptoCard from "@/components/crypto-card";
import { DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/users/profile"],
    retry: false,
    enabled: !!user,
  });

  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ["/api/market-data"],
    retry: false,
  });

  const { data: cryptocurrencies, isLoading: cryptoLoading } = useQuery({
    queryKey: ["/api/cryptocurrencies"],
    retry: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (user) {
      websocketService.connect(user.id, user.isAdmin);
    }

    return () => {
      websocketService.disconnect();
    };
  }, [user, authLoading, toast]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log('WebSocket connected to dashboard');
      // Authenticate with the WebSocket server
      ws.send(JSON.stringify({
        type: 'authenticate',
        data: { userId: user.id.toString(), isAdmin: false }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'balance_updated') {
          console.log('Received balance update:', message.data);
          // Refresh profile data immediately
          queryClient.invalidateQueries({ queryKey: ["/api/users/profile"] });
        } else if (message.type === 'market_data_update') {
          // Refresh market data
          queryClient.invalidateQueries({ queryKey: ["/api/market-data"] });
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected from dashboard');
    };

    return () => {
      ws.close();
    };
  }, [user, queryClient]);

  if (authLoading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  // Calculate total portfolio value
  const totalPortfolioValue = profile.wallets?.reduce((total, wallet) => {
    const cryptoMarketData = marketData?.find(
      (data) => data.cryptoId === wallet.cryptocurrency.id
    );
    if (cryptoMarketData) {
      return total + parseFloat(wallet.balance) * parseFloat(cryptoMarketData.priceZar);
    }
    return total;
  }, 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile.firstName}!
            </h1>
            <p className="text-gray-600">
              {profile.city}, {profile.country} 🇿🇦
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Verified Account
          </Badge>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{totalPortfolioValue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ZAR Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{parseFloat(profile.zarBalance?.balance || "0").toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for trading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.wallets?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Cryptocurrency wallets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.transactions?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <WalletBalance 
                  wallets={profile.wallets || []} 
                  marketData={marketData || []}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.transactions?.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.cryptocurrency.name}</p>
                          <p className="text-sm text-gray-500">{transaction.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {transaction.amount} {transaction.cryptocurrency.symbol}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!profile.transactions || profile.transactions.length === 0) && (
                    <p className="text-center text-gray-500">No transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cryptoLoading || marketLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="crypto-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-6 w-24 mb-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </CardContent>
                </Card>
              ))
            ) : (
              cryptocurrencies?.map((crypto) => {
                const cryptoMarketData = marketData?.find(
                  (data) => data.cryptoId === crypto.id
                );
                return (
                  <CryptoCard
                    key={crypto.id}
                    cryptocurrency={crypto}
                    marketData={cryptoMarketData}
                  />
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionHistory transactions={profile.transactions || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
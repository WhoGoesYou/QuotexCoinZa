import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { websocketService } from "@/services/websocket";
import TradingInterface from "@/components/trading-interface";
import { TrendingUp, BarChart3, Activity } from "lucide-react";

export default function Trading() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedCrypto, setSelectedCrypto] = useState<string>("BTC");

  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ["/api/market-data"],
    retry: false,
  });

  const { data: cryptocurrencies, isLoading: cryptoLoading } = useQuery({
    queryKey: ["/api/cryptocurrencies"],
    retry: false,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/users/profile"],
    retry: false,
    enabled: !!user,
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

  if (authLoading || profileLoading || marketLoading || cryptoLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="trading-panel">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="animate-pulse bg-gray-300 h-6 w-32 rounded"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="animate-pulse bg-gray-300 h-64 rounded"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="animate-pulse bg-gray-300 h-32 rounded"></div>
                    <div className="animate-pulse bg-gray-300 h-32 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="animate-pulse bg-gray-300 h-6 w-24 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse bg-gray-300 h-40 rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const selectedCryptoData = cryptocurrencies?.find(
    crypto => crypto.symbol === selectedCrypto
  );

  const selectedMarketData = marketData?.find(
    data => data.cryptoId === selectedCryptoData?.id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trading Platform</h1>
            <p className="text-gray-600">
              Advanced trading tools for serious traders
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">ZAR Balance</p>
              <p className="text-lg font-semibold">
                R{parseFloat(profile?.zarBalance?.balance || "0").toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {marketData?.slice(0, 4).map((data) => {
          const crypto = cryptocurrencies?.find(c => c.id === data.cryptoId);
          const isPositive = parseFloat(data.percentChange24h || "0") >= 0;
          return (
            <Card 
              key={data.cryptoId} 
              className={`cursor-pointer transition-all ${
                crypto?.symbol === selectedCrypto ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCrypto(crypto?.symbol || "BTC")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{crypto?.name}</span>
                  <span className={`text-sm ${isPositive ? 'market-positive' : 'market-negative'}`}>
                    {isPositive ? '+' : ''}{data.percentChange24h}%
                  </span>
                </div>
                <div className="text-lg font-bold">
                  R{parseFloat(data.priceZar).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trading Panel */}
        <div className="lg:col-span-2">
          <Card className="trading-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>
                  {selectedCryptoData?.name} / ZAR Trading
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Price Display */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      R{selectedMarketData ? parseFloat(selectedMarketData.priceZar).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0"}
                    </div>
                    <div className={`text-sm ${
                      parseFloat(selectedMarketData?.percentChange24h || "0") >= 0 
                        ? 'market-positive' 
                        : 'market-negative'
                    }`}>
                      {parseFloat(selectedMarketData?.percentChange24h || "0") >= 0 ? '+' : ''}
                      {selectedMarketData?.percentChange24h}% (24h)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Market Cap</div>
                    <div className="font-semibold">
                      R{selectedMarketData ? parseFloat(selectedMarketData.marketCap || "0").toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0"}
                    </div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-gray-50 rounded-xl p-6 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Trading Chart</p>
                    <p className="text-sm text-gray-500">
                      Live price movements for {selectedCryptoData?.name}
                    </p>
                  </div>
                </div>

                {/* Order Book and Recent Trades */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Book</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {/* Sell Orders */}
                        {[...Array(3)].map((_, i) => {
                          const price = selectedMarketData ? parseFloat(selectedMarketData.priceZar) + (i + 1) * 50 : 0;
                          return (
                            <div key={`sell-${i}`} className="flex justify-between text-sm">
                              <span className="text-red-600">R{price.toLocaleString()}</span>
                              <span className="text-gray-600">0.{Math.floor(Math.random() * 9000) + 1000}</span>
                            </div>
                          );
                        })}
                        <hr className="my-2" />
                        {/* Buy Orders */}
                        {[...Array(3)].map((_, i) => {
                          const price = selectedMarketData ? parseFloat(selectedMarketData.priceZar) - (i + 1) * 50 : 0;
                          return (
                            <div key={`buy-${i}`} className="flex justify-between text-sm">
                              <span className="text-green-600">R{price.toLocaleString()}</span>
                              <span className="text-gray-600">0.{Math.floor(Math.random() * 9000) + 1000}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Trades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {profile?.transactions?.slice(0, 6).map((transaction, index) => (
                          <div key={transaction.id} className="flex justify-between text-sm">
                            <span className={`${
                              transaction.type === 'buy' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              R{selectedMarketData ? parseFloat(selectedMarketData.priceZar).toLocaleString() : "0"}
                            </span>
                            <span className="text-gray-600">{transaction.amount}</span>
                            <span className="text-gray-500">
                              {new Date(transaction.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        )) || (
                          <div className="text-center py-4 text-gray-500">
                            No recent trades
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trading Interface */}
        <div className="space-y-6">
          <TradingInterface
            selectedCrypto={selectedCryptoData}
            marketData={selectedMarketData}
            userProfile={profile}
          />

          {/* Wallet Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ZAR</span>
                  <span className="font-semibold">
                    R{parseFloat(profile?.zarBalance?.balance || "0").toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {profile?.wallets?.map((wallet) => (
                  <div key={wallet.id} className="flex justify-between">
                    <span className="text-gray-600">{wallet.cryptocurrency.symbol}</span>
                    <span className="font-semibold">
                      {parseFloat(wallet.balance).toFixed(8)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

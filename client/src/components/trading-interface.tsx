import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Cryptocurrency, MarketData } from "@shared/schema";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TradingInterfaceProps {
  selectedCrypto?: Cryptocurrency;
  marketData?: MarketData;
  userProfile?: any;
}

export default function TradingInterface({ selectedCrypto, marketData, userProfile }: TradingInterfaceProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [total, setTotal] = useState("");

  const currentPrice = marketData ? parseFloat(marketData.priceZar) : 0;
  const zarBalance = userProfile?.zarBalance ? parseFloat(userProfile.zarBalance.balance) : 0;
  
  const userWallet = userProfile?.wallets?.find(
    (wallet: any) => wallet.cryptocurrency.id === selectedCrypto?.id
  );
  const cryptoBalance = userWallet ? parseFloat(userWallet.balance) : 0;

  const tradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      await apiRequest("POST", "/api/transactions", tradeData);
    },
    onSuccess: () => {
      toast({
        title: "Trade Successful",
        description: `${activeTab === "buy" ? "Bought" : "Sold"} ${amount} ${selectedCrypto?.symbol}`,
      });
      
      // Reset form
      setAmount("");
      setPrice("");
      setTotal("");
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Trade Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (value && price) {
      const totalValue = parseFloat(value) * parseFloat(price);
      setTotal(totalValue.toFixed(2));
    }
  };

  const handlePriceChange = (value: string) => {
    setPrice(value);
    if (value && amount) {
      const totalValue = parseFloat(amount) * parseFloat(value);
      setTotal(totalValue.toFixed(2));
    }
  };

  const handleTotalChange = (value: string) => {
    setTotal(value);
    if (value && price) {
      const amountValue = parseFloat(value) / parseFloat(price);
      setAmount(amountValue.toFixed(8));
    }
  };

  const handleMarketPrice = () => {
    setPrice(currentPrice.toString());
    if (amount) {
      const totalValue = parseFloat(amount) * currentPrice;
      setTotal(totalValue.toFixed(2));
    }
  };

  const handleMaxAmount = () => {
    if (activeTab === "buy") {
      // For buying, use available ZAR balance
      const maxAmount = zarBalance / currentPrice;
      setAmount(maxAmount.toFixed(8));
      setTotal(zarBalance.toFixed(2));
    } else {
      // For selling, use available crypto balance
      setAmount(cryptoBalance.toFixed(8));
      if (price) {
        const totalValue = cryptoBalance * parseFloat(price);
        setTotal(totalValue.toFixed(2));
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedCrypto || !amount || !price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const tradeAmount = parseFloat(amount);
    const tradePrice = parseFloat(price);
    const tradeTotal = parseFloat(total);

    if (activeTab === "buy") {
      if (tradeTotal > zarBalance) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough ZAR balance for this trade.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (tradeAmount > cryptoBalance) {
        toast({
          title: "Insufficient Balance",
          description: `You don't have enough ${selectedCrypto.symbol} for this trade.`,
          variant: "destructive",
        });
        return;
      }
    }

    tradeMutation.mutate({
      cryptoId: selectedCrypto.id,
      type: activeTab,
      amount: tradeAmount.toString(),
      price: tradePrice.toString(),
      totalZar: tradeTotal.toString(),
    });
  };

  if (!selectedCrypto) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Select a cryptocurrency to start trading
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = marketData ? parseFloat(marketData.percentChange24h || "0") >= 0 : true;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Trade {selectedCrypto.symbol}</span>
          <div className={`text-sm flex items-center ${isPositive ? 'market-positive' : 'market-negative'}`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {marketData?.percentChange24h}%
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "buy" | "sell")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buy-amount">Amount ({selectedCrypto.symbol})</Label>
                <div className="flex space-x-2">
                  <Input
                    id="buy-amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={handleMaxAmount}>
                    Max
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buy-price">Price (ZAR)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="buy-price"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={handleMarketPrice}>
                    Market
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buy-total">Total (ZAR)</Label>
                <Input
                  id="buy-total"
                  type="number"
                  placeholder="0.00"
                  value={total}
                  onChange={(e) => handleTotalChange(e.target.value)}
                />
              </div>

              <div className="text-sm text-gray-500">
                Available: R{zarBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={tradeMutation.isPending || !amount || !price}
                className="w-full gradient-green text-white hover:opacity-90"
              >
                {tradeMutation.isPending ? "Processing..." : `Buy ${selectedCrypto.symbol}`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sell-amount">Amount ({selectedCrypto.symbol})</Label>
                <div className="flex space-x-2">
                  <Input
                    id="sell-amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={handleMaxAmount}>
                    Max
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sell-price">Price (ZAR)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="sell-price"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={handleMarketPrice}>
                    Market
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sell-total">Total (ZAR)</Label>
                <Input
                  id="sell-total"
                  type="number"
                  placeholder="0.00"
                  value={total}
                  onChange={(e) => handleTotalChange(e.target.value)}
                />
              </div>

              <div className="text-sm text-gray-500">
                Available: {cryptoBalance.toFixed(8)} {selectedCrypto.symbol}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={tradeMutation.isPending || !amount || !price}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                {tradeMutation.isPending ? "Processing..." : `Sell ${selectedCrypto.symbol}`}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

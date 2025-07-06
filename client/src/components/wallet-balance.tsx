import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { WalletWithCrypto, MarketData } from "@shared/schema";
import { Wallet, TrendingUp, TrendingDown, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WalletBalanceProps {
  wallets: WalletWithCrypto[];
  marketData: MarketData[];
}

export default function WalletBalance({ wallets, marketData }: WalletBalanceProps) {
  const { toast } = useToast();

  const formatBalance = (balance: string, symbol: string) => {
    const numBalance = parseFloat(balance);
    if (numBalance === 0) return "0";
    if (numBalance < 0.001) return numBalance.toFixed(8);
    return numBalance.toFixed(4);
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getMarketValue = (wallet: WalletWithCrypto) => {
    const market = marketData.find(m => m.cryptoId === wallet.cryptocurrency.id);
    if (!market) return 0;
    return parseFloat(wallet.balance) * parseFloat(market.priceZar);
  };

  const getPercentChange = (cryptoId: number) => {
    const market = marketData.find(m => m.cryptoId === cryptoId);
    return market ? parseFloat(market.percentChange24h || "0") : 0;
  };

  const totalPortfolioValue = wallets.reduce((total, wallet) => total + getMarketValue(wallet), 0);

  if (wallets.length === 0) {
    return (
      <div className="text-center py-8">
        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No wallets found</p>
        <p className="text-sm text-gray-400">
          Wallets will be created automatically when you sign up
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Portfolio Value</p>
              <p className="text-3xl font-bold text-gray-900">
                R{totalPortfolioValue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Active Wallets</p>
              <p className="text-2xl font-semibold text-primary">{wallets.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Wallets */}
      <div className="space-y-4">
        {wallets.map((wallet) => {
          const marketValue = getMarketValue(wallet);
          const percentChange = getPercentChange(wallet.cryptocurrency.id);
          const isPositive = percentChange >= 0;
          const hasBalance = parseFloat(wallet.balance) > 0;

          return (
            <Card key={wallet.id} className={`transition-all hover:shadow-md ${hasBalance ? 'border-green-200 bg-green-50/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{wallet.cryptocurrency.name}</h3>
                        <Badge variant="outline" className="wallet-badge">
                          {wallet.cryptocurrency.symbol}
                        </Badge>
                        {hasBalance && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-500 font-mono">
                          {formatAddress(wallet.address)}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                          onClick={() => copyToClipboard(wallet.address, "Wallet address")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatBalance(wallet.balance, wallet.cryptocurrency.symbol)} {wallet.cryptocurrency.symbol}
                    </div>
                    <div className="text-sm text-gray-600">
                      R{marketValue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`text-xs flex items-center justify-end mt-1 ${isPositive ? 'market-positive' : 'market-negative'}`}>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {isPositive ? '+' : ''}{percentChange.toFixed(2)}% (24h)
                    </div>
                  </div>
                </div>

                {/* Wallet Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(wallet.address, "Address")}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Address
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // In a real app, this would open a blockchain explorer
                        const explorers: Record<string, string> = {
                          BTC: `https://blockstream.info/address/${wallet.address}`,
                          ETH: `https://etherscan.io/address/${wallet.address}`,
                          XRP: `https://xrpscan.com/account/${wallet.address}`,
                          SOL: `https://solscan.io/account/${wallet.address}`,
                        };
                        const explorerUrl = explorers[wallet.cryptocurrency.symbol];
                        if (explorerUrl) {
                          window.open(explorerUrl, '_blank');
                        } else {
                          toast({
                            title: "Explorer not available",
                            description: `Blockchain explorer not configured for ${wallet.cryptocurrency.symbol}`,
                          });
                        }
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View on Explorer
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500">
                    Created: {new Date(wallet.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Wallet Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">About Your Wallets</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Each cryptocurrency has its own unique wallet address</li>
                <li>• Use these addresses to receive funds from external sources</li>
                <li>• Your private keys are securely managed by QUOTEX COIN za</li>
                <li>• All transactions are protected with bank-level security</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

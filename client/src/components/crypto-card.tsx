import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Coins } from "lucide-react";
import type { Cryptocurrency, MarketData } from "@shared/schema";

interface CryptoCardProps {
  cryptocurrency: Cryptocurrency;
  marketData?: MarketData;
}

export default function CryptoCard({ cryptocurrency, marketData }: CryptoCardProps) {
  const isPositive = marketData ? parseFloat(marketData.percentChange24h || "0") >= 0 : true;
  const priceZar = marketData ? parseFloat(marketData.priceZar) : 0;
  const percentChange = marketData ? parseFloat(marketData.percentChange24h || "0") : 0;

  return (
    <Card className="crypto-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Coins className="text-primary w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{cryptocurrency.name}</h3>
              <p className="text-sm text-gray-500">{cryptocurrency.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">
              R{priceZar.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm flex items-center ${isPositive ? 'market-positive' : 'market-negative'}`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
            </div>
          </div>
        </div>
        
        <div className="h-20 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg flex items-end justify-end p-2">
          <div className="text-xs text-primary flex items-center">
            {isPositive ? (
              <>
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>Trending up</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 mr-1" />
                <span>Trending down</span>
              </>
            )}
          </div>
        </div>
        
        {marketData && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Volume (24h)</span>
              <span className="font-medium">
                R{parseFloat(marketData.volume24h || "0").toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Market Cap</span>
              <span className="font-medium">
                R{parseFloat(marketData.marketCap || "0").toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        )}
        
        <Badge variant="outline" className="mt-3 wallet-badge">
          <span className="south-african-flag mr-1"></span>
          ZAR Trading
        </Badge>
      </CardContent>
    </Card>
  );
}

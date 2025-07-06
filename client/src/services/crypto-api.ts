// Cryptocurrency API service for fetching real-time data
// Uses CoinGecko API as the primary data source

interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
    zar: number;
    usd_24h_change: number;
    zar_24h_change: number;
    usd_market_cap: number;
    zar_market_cap: number;
    usd_24h_vol: number;
    zar_24h_vol: number;
  };
}

interface CryptoPrice {
  symbol: string;
  name: string;
  priceUsd: number;
  priceZar: number;
  percentChange24h: number;
  marketCapUsd: number;
  marketCapZar: number;
  volume24hUsd: number;
  volume24hZar: number;
  lastUpdated: Date;
}

class CryptoAPIService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private readonly apiKey = process.env.COINGECKO_API_KEY || '';
  private cache: Map<string, { data: CryptoPrice[]; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute cache

  // Mapping of our cryptocurrency symbols to CoinGecko IDs
  private readonly coinGeckoIds: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'XRP': 'ripple',
    'SOL': 'solana',
    'USDT': 'tether',
    'USDC': 'usd-coin',
  };

  private readonly cryptoNames: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'XRP': 'XRP',
    'SOL': 'Solana',
    'USDT': 'Tether',
    'USDC': 'USD Coin',
  };

  async getPrices(symbols: string[] = Object.keys(this.coinGeckoIds)): Promise<CryptoPrice[]> {
    const cacheKey = symbols.sort().join(',');
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const coinGeckoIds = symbols
        .map(symbol => this.coinGeckoIds[symbol.toUpperCase()])
        .filter(Boolean);

      if (coinGeckoIds.length === 0) {
        throw new Error('No valid cryptocurrency symbols provided');
      }

      const response = await this.fetchWithFallback(
        `${this.baseUrl}/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd,zar&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: CoinGeckoPrice = await response.json();
      const prices = this.transformCoinGeckoData(data);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: prices,
        timestamp: Date.now()
      });

      return prices;
    } catch (error) {
      console.error('Error fetching cryptocurrency prices:', error);
      
      // Return fallback data if API fails
      return this.getFallbackPrices(symbols);
    }
  }

  private async fetchWithFallback(url: string): Promise<Response> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    // Add API key if available
    if (this.apiKey) {
      headers['x-cg-demo-api-key'] = this.apiKey;
    }

    try {
      return await fetch(url, { headers });
    } catch (error) {
      console.error('Primary API request failed, trying without API key:', error);
      
      // Retry without API key if it fails
      delete headers['x-cg-demo-api-key'];
      return await fetch(url, { headers });
    }
  }

  private transformCoinGeckoData(data: CoinGeckoPrice): CryptoPrice[] {
    const prices: CryptoPrice[] = [];

    for (const [coinId, priceData] of Object.entries(data)) {
      const symbol = this.getSymbolFromCoinId(coinId);
      if (!symbol) continue;

      prices.push({
        symbol,
        name: this.cryptoNames[symbol] || symbol,
        priceUsd: priceData.usd || 0,
        priceZar: priceData.zar || 0,
        percentChange24h: priceData.usd_24h_change || 0,
        marketCapUsd: priceData.usd_market_cap || 0,
        marketCapZar: priceData.zar_market_cap || 0,
        volume24hUsd: priceData.usd_24h_vol || 0,
        volume24hZar: priceData.zar_24h_vol || 0,
        lastUpdated: new Date(),
      });
    }

    return prices;
  }

  private getSymbolFromCoinId(coinId: string): string | null {
    for (const [symbol, id] of Object.entries(this.coinGeckoIds)) {
      if (id === coinId) {
        return symbol;
      }
    }
    return null;
  }

  private getFallbackPrices(symbols: string[]): CryptoPrice[] {
    // Fallback prices with realistic South African Rand values
    const fallbackData: Record<string, Omit<CryptoPrice, 'symbol' | 'name' | 'lastUpdated'>> = {
      'BTC': {
        priceUsd: 108748.97,
        priceZar: 1847892.45,
        percentChange24h: 2.56,
        marketCapUsd: 2100000000000,
        marketCapZar: 35700000000000,
        volume24hUsd: 25000000000,
        volume24hZar: 425000000000,
      },
      'ETH': {
        priceUsd: 2546.86,
        priceZar: 43295.68,
        percentChange24h: 1.62,
        marketCapUsd: 306000000000,
        marketCapZar: 5202000000000,
        volume24hUsd: 12000000000,
        volume24hZar: 204000000000,
      },
      'XRP': {
        priceUsd: 2.27,
        priceZar: 38.56,
        percentChange24h: 2.70,
        marketCapUsd: 126000000000,
        marketCapZar: 2142000000000,
        volume24hUsd: 3500000000,
        volume24hZar: 59500000000,
      },
      'SOL': {
        priceUsd: 151.57,
        priceZar: 2574.85,
        percentChange24h: 3.03,
        marketCapUsd: 71000000000,
        marketCapZar: 1207000000000,
        volume24hUsd: 2200000000,
        volume24hZar: 37400000000,
      },
      'USDT': {
        priceUsd: 1.00,
        priceZar: 17.00,
        percentChange24h: 0.00,
        marketCapUsd: 100000000000,
        marketCapZar: 1700000000000,
        volume24hUsd: 50000000000,
        volume24hZar: 850000000000,
      },
      'USDC': {
        priceUsd: 1.00,
        priceZar: 17.00,
        percentChange24h: 0.00,
        marketCapUsd: 40000000000,
        marketCapZar: 680000000000,
        volume24hUsd: 8000000000,
        volume24hZar: 136000000000,
      },
    };

    return symbols
      .filter(symbol => fallbackData[symbol.toUpperCase()])
      .map(symbol => ({
        symbol: symbol.toUpperCase(),
        name: this.cryptoNames[symbol.toUpperCase()] || symbol,
        ...fallbackData[symbol.toUpperCase()],
        lastUpdated: new Date(),
      }));
  }

  // Get exchange rate for USD to ZAR
  async getUsdToZarRate(): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=usd&vs_currencies=zar`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }
      
      const data = await response.json();
      return data.usd?.zar || 17.0; // Fallback to approximate rate
    } catch (error) {
      console.error('Error fetching USD/ZAR exchange rate:', error);
      return 17.0; // Fallback exchange rate
    }
  }

  // Convert USD amount to ZAR
  async convertUsdToZar(usdAmount: number): Promise<number> {
    const rate = await this.getUsdToZarRate();
    return usdAmount * rate;
  }

  // Convert ZAR amount to USD
  async convertZarToUsd(zarAmount: number): Promise<number> {
    const rate = await this.getUsdToZarRate();
    return zarAmount / rate;
  }

  // Get historical data for a cryptocurrency
  async getHistoricalData(symbol: string, days: number = 7): Promise<any[]> {
    const coinId = this.coinGeckoIds[symbol.toUpperCase()];
    if (!coinId) {
      throw new Error(`Cryptocurrency ${symbol} not supported`);
    }

    try {
      const response = await this.fetchWithFallback(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=zar&days=${days}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch historical data: ${response.status}`);
      }

      const data = await response.json();
      return data.prices || [];
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache status
  getCacheStatus() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Create singleton instance
export const cryptoAPIService = new CryptoAPIService();

// Export types
export type { CryptoPrice };

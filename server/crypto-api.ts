import { storage } from './storage';

interface CoinGeckoPrice {
  bitcoin: { usd: number; zar: number; ngn: number };
  ethereum: { usd: number; zar: number; ngn: number };
  ripple: { usd: number; zar: number; ngn: number };
  solana: { usd: number; zar: number; ngn: number };
  tether: { usd: number; zar: number; ngn: number };
  'usd-coin': { usd: number; zar: number; ngn: number };
}

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';

export async function fetchCryptoPrices(): Promise<void> {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}?ids=bitcoin,ethereum,ripple,solana,tether,usd-coin&vs_currencies=usd,zar,ngn`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoPrice = await response.json();
    
    // Update market data in database
    const cryptoMap = {
      bitcoin: { id: 1, symbol: 'BTC' },
      ethereum: { id: 2, symbol: 'ETH' },
      ripple: { id: 3, symbol: 'XRP' },
      solana: { id: 4, symbol: 'SOL' },
      tether: { id: 5, symbol: 'USDT' },
      'usd-coin': { id: 6, symbol: 'USDC' }
    };

    for (const [coinId, crypto] of Object.entries(cryptoMap)) {
      const priceData = data[coinId as keyof CoinGeckoPrice];
      if (priceData) {
        await storage.updateMarketData(crypto.id, {
          priceUsd: priceData.usd.toString(),
          priceZar: priceData.zar.toString(),
          priceNgn: priceData.ngn.toString(),
          lastUpdated: new Date()
        });
      }
    }

    console.log('✅ Crypto prices updated successfully');
  } catch (error) {
    console.error('❌ Error fetching crypto prices:', error);
  }
}

// Update prices every 30 seconds
let priceUpdateInterval: NodeJS.Timeout;

export function startPriceUpdates(): void {
  // Initial fetch
  fetchCryptoPrices();
  
  // Schedule regular updates
  priceUpdateInterval = setInterval(fetchCryptoPrices, 30000);
  console.log('🔄 Started crypto price updates (every 30 seconds)');
}

export function stopPriceUpdates(): void {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval);
    console.log('⏹️ Stopped crypto price updates');
  }
}
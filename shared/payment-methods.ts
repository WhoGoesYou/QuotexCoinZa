// Global payment methods and wallet types for cryptocurrency platform

export const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
];

export const PAYMENT_METHODS = [
  // Bank transfers
  { id: 'bank_transfer', name: 'Bank Transfer', category: 'banking', regions: ['global'] },
  { id: 'wire_transfer', name: 'Wire Transfer', category: 'banking', regions: ['global'] },
  { id: 'ach', name: 'ACH Transfer', category: 'banking', regions: ['US', 'CA'] },
  { id: 'sepa', name: 'SEPA Transfer', category: 'banking', regions: ['EU'] },
  { id: 'faster_payments', name: 'Faster Payments', category: 'banking', regions: ['UK'] },
  
  // Cards
  { id: 'credit_card', name: 'Credit Card', category: 'card', regions: ['global'] },
  { id: 'debit_card', name: 'Debit Card', category: 'card', regions: ['global'] },
  
  // Digital wallets
  { id: 'paypal', name: 'PayPal', category: 'digital_wallet', regions: ['global'] },
  { id: 'apple_pay', name: 'Apple Pay', category: 'digital_wallet', regions: ['global'] },
  { id: 'google_pay', name: 'Google Pay', category: 'digital_wallet', regions: ['global'] },
  { id: 'samsung_pay', name: 'Samsung Pay', category: 'digital_wallet', regions: ['global'] },
  
  // African payment methods
  { id: 'mpesa', name: 'M-Pesa', category: 'mobile_money', regions: ['KE', 'TZ', 'UG'] },
  { id: 'airtel_money', name: 'Airtel Money', category: 'mobile_money', regions: ['NG', 'KE', 'UG', 'ZM'] },
  { id: 'flutterwave', name: 'Flutterwave', category: 'payment_gateway', regions: ['NG', 'GH', 'KE'] },
  { id: 'paystack', name: 'Paystack', category: 'payment_gateway', regions: ['NG', 'GH', 'ZA'] },
  
  // Crypto-specific
  { id: 'wallet_address', name: 'Crypto Wallet', category: 'crypto', regions: ['global'] },
  { id: 'exchange_transfer', name: 'Exchange Transfer', category: 'crypto', regions: ['global'] }
];

export const CRYPTO_NETWORKS = [
  // Bitcoin networks
  { symbol: 'BTC', network: 'bitcoin', name: 'Bitcoin', addressFormat: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/ },
  { symbol: 'BTC', network: 'bitcoin_testnet', name: 'Bitcoin Testnet', addressFormat: /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$|^tb1[a-z0-9]{39,59}$/ },
  
  // Ethereum and ERC-20 tokens
  { symbol: 'ETH', network: 'ethereum', name: 'Ethereum', addressFormat: /^0x[a-fA-F0-9]{40}$/ },
  { symbol: 'USDT', network: 'ethereum', name: 'Tether (ERC-20)', addressFormat: /^0x[a-fA-F0-9]{40}$/ },
  { symbol: 'USDC', network: 'ethereum', name: 'USD Coin (ERC-20)', addressFormat: /^0x[a-fA-F0-9]{40}$/ },
  { symbol: 'USDT', network: 'tron', name: 'Tether (TRC-20)', addressFormat: /^T[A-Za-z1-9]{33}$/ },
  { symbol: 'USDC', network: 'polygon', name: 'USD Coin (Polygon)', addressFormat: /^0x[a-fA-F0-9]{40}$/ },
  
  // Other major cryptocurrencies
  { symbol: 'XRP', network: 'ripple', name: 'Ripple', addressFormat: /^r[0-9a-zA-Z]{24,34}$/ },
  { symbol: 'SOL', network: 'solana', name: 'Solana', addressFormat: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/ },
  { symbol: 'ADA', network: 'cardano', name: 'Cardano', addressFormat: /^addr1[a-z0-9]{58}$/ },
  { symbol: 'DOT', network: 'polkadot', name: 'Polkadot', addressFormat: /^1[a-zA-Z0-9]{47}$/ },
  { symbol: 'MATIC', network: 'polygon', name: 'Polygon', addressFormat: /^0x[a-fA-F0-9]{40}$/ },
  { symbol: 'AVAX', network: 'avalanche', name: 'Avalanche', addressFormat: /^[XPC]-[a-zA-Z0-9]{39}$/ },
  { symbol: 'ATOM', network: 'cosmos', name: 'Cosmos', addressFormat: /^cosmos1[a-z0-9]{38}$/ },
  { symbol: 'LTC', network: 'litecoin', name: 'Litecoin', addressFormat: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/ },
  { symbol: 'BCH', network: 'bitcoin_cash', name: 'Bitcoin Cash', addressFormat: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bitcoincash:[a-z0-9]{42}$/ },
  { symbol: 'BNB', network: 'binance_smart_chain', name: 'BNB Smart Chain', addressFormat: /^0x[a-fA-F0-9]{40}$/ },
  { symbol: 'ALGO', network: 'algorand', name: 'Algorand', addressFormat: /^[A-Z2-7]{58}$/ }
];

export const WALLET_PROVIDERS = [
  // Hardware wallets
  { name: 'Ledger', type: 'hardware', supported_cryptos: ['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOT'] },
  { name: 'Trezor', type: 'hardware', supported_cryptos: ['BTC', 'ETH', 'XRP', 'LTC', 'BCH'] },
  { name: 'KeepKey', type: 'hardware', supported_cryptos: ['BTC', 'ETH', 'LTC', 'BCH'] },
  
  // Software wallets
  { name: 'MetaMask', type: 'software', supported_cryptos: ['ETH', 'USDT', 'USDC', 'MATIC', 'BNB'] },
  { name: 'Trust Wallet', type: 'software', supported_cryptos: ['BTC', 'ETH', 'BNB', 'SOL', 'ADA'] },
  { name: 'Exodus', type: 'software', supported_cryptos: ['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOT'] },
  { name: 'Atomic Wallet', type: 'software', supported_cryptos: ['BTC', 'ETH', 'XRP', 'SOL', 'ATOM'] },
  { name: 'Coinbase Wallet', type: 'software', supported_cryptos: ['BTC', 'ETH', 'USDT', 'USDC', 'SOL'] },
  
  // Exchange wallets
  { name: 'Binance', type: 'exchange', supported_cryptos: ['BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'SOL'] },
  { name: 'Coinbase', type: 'exchange', supported_cryptos: ['BTC', 'ETH', 'USDT', 'USDC', 'SOL'] },
  { name: 'Kraken', type: 'exchange', supported_cryptos: ['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOT'] },
  { name: 'KuCoin', type: 'exchange', supported_cryptos: ['BTC', 'ETH', 'USDT', 'SOL', 'MATIC'] },
  
  // Mobile wallets
  { name: 'Phantom', type: 'mobile', supported_cryptos: ['SOL'] },
  { name: 'Yoroi', type: 'mobile', supported_cryptos: ['ADA'] },
  { name: 'Daedalus', type: 'desktop', supported_cryptos: ['ADA'] },
  { name: 'Electrum', type: 'desktop', supported_cryptos: ['BTC'] },
  { name: 'MyEtherWallet', type: 'web', supported_cryptos: ['ETH', 'USDT', 'USDC'] }
];

export function getPaymentMethodsByRegion(region: string) {
  return PAYMENT_METHODS.filter(method => 
    method.regions.includes('global') || method.regions.includes(region)
  );
}

export function getCryptoNetworks(symbol: string) {
  return CRYPTO_NETWORKS.filter(network => network.symbol === symbol);
}

export function getWalletProviders(cryptoSymbol: string) {
  return WALLET_PROVIDERS.filter(provider => 
    provider.supported_cryptos.includes(cryptoSymbol)
  );
}

export function validateWalletAddress(address: string, symbol: string, network?: string) {
  const networks = network 
    ? CRYPTO_NETWORKS.filter(n => n.symbol === symbol && n.network === network)
    : CRYPTO_NETWORKS.filter(n => n.symbol === symbol);
  
  return networks.some(net => net.addressFormat.test(address));
}
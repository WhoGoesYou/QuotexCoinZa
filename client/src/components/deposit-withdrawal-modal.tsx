import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowDownCircle,
  ArrowUpCircle,
  Copy,
  CreditCard,
  Building,
  Smartphone,
  Wallet,
  Globe,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface DepositWithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  type: "deposit" | "withdrawal";
  selectedCrypto?: any;
  marketData?: any[];
}

const PAYMENT_METHODS = {
  banking: [
    { id: 'bank_transfer', name: 'Bank Transfer', icon: Building, regions: ['global'], fees: '0.5%' },
    { id: 'wire_transfer', name: 'Wire Transfer', icon: Building, regions: ['global'], fees: '1.0%' },
    { id: 'ach', name: 'ACH Transfer', icon: Building, regions: ['US', 'CA'], fees: '0.25%' },
    { id: 'sepa', name: 'SEPA Transfer', icon: Building, regions: ['EU'], fees: '0.1%' }
  ],
  cards: [
    { id: 'credit_card', name: 'Credit Card', icon: CreditCard, regions: ['global'], fees: '3.5%' },
    { id: 'debit_card', name: 'Debit Card', icon: CreditCard, regions: ['global'], fees: '2.5%' }
  ],
  digital: [
    { id: 'paypal', name: 'PayPal', icon: Wallet, regions: ['global'], fees: '2.9%' },
    { id: 'apple_pay', name: 'Apple Pay', icon: Smartphone, regions: ['global'], fees: '2.9%' },
    { id: 'google_pay', name: 'Google Pay', icon: Smartphone, regions: ['global'], fees: '2.9%' }
  ],
  african: [
    { id: 'mpesa', name: 'M-Pesa', icon: Smartphone, regions: ['KE', 'TZ', 'UG'], fees: '1.5%' },
    { id: 'paystack', name: 'Paystack', icon: Globe, regions: ['NG', 'GH', 'ZA'], fees: '1.95%' },
    { id: 'flutterwave', name: 'Flutterwave', icon: Globe, regions: ['NG', 'GH', 'KE'], fees: '1.4%' }
  ],
  crypto: [
    { id: 'wallet_address', name: 'Crypto Wallet', icon: Wallet, regions: ['global'], fees: 'Network fees only' },
    { id: 'exchange_transfer', name: 'Exchange Transfer', icon: Building, regions: ['global'], fees: '0.1%' }
  ]
};

const CRYPTO_NETWORKS = {
  BTC: [
    { network: 'bitcoin', name: 'Bitcoin Network', fees: '~$2-15', time: '10-60 min' },
    { network: 'bitcoin_lightning', name: 'Lightning Network', fees: '~$0.01', time: '< 1 min' }
  ],
  ETH: [
    { network: 'ethereum', name: 'Ethereum (ERC-20)', fees: '~$5-50', time: '2-10 min' },
    { network: 'polygon', name: 'Polygon (MATIC)', fees: '~$0.01', time: '< 1 min' },
    { network: 'arbitrum', name: 'Arbitrum One', fees: '~$0.50', time: '< 1 min' }
  ],
  USDT: [
    { network: 'ethereum', name: 'Ethereum (ERC-20)', fees: '~$5-50', time: '2-10 min' },
    { network: 'tron', name: 'Tron (TRC-20)', fees: '~$0.50', time: '1-3 min' },
    { network: 'polygon', name: 'Polygon', fees: '~$0.01', time: '< 1 min' },
    { network: 'bsc', name: 'BSC (BEP-20)', fees: '~$0.10', time: '< 1 min' }
  ],
  USDC: [
    { network: 'ethereum', name: 'Ethereum (ERC-20)', fees: '~$5-50', time: '2-10 min' },
    { network: 'polygon', name: 'Polygon', fees: '~$0.01', time: '< 1 min' },
    { network: 'solana', name: 'Solana (SPL)', fees: '~$0.01', time: '< 1 min' },
    { network: 'avalanche', name: 'Avalanche C-Chain', fees: '~$0.50', time: '< 1 min' }
  ],
  XRP: [
    { network: 'ripple', name: 'XRP Ledger', fees: '~$0.01', time: '< 1 min' }
  ],
  SOL: [
    { network: 'solana', name: 'Solana Network', fees: '~$0.01', time: '< 1 min' }
  ]
};

const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' }
];

export function DepositWithdrawalModal({ 
  open, 
  onClose, 
  type, 
  selectedCrypto, 
  marketData = [] 
}: DepositWithdrawalModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState("USD");
  const [walletAddress, setWalletAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [step, setStep] = useState(1);

  const currentMarketData = marketData.find(m => m.cryptoId === selectedCrypto?.id);
  const cryptoNetworks = CRYPTO_NETWORKS[selectedCrypto?.symbol as keyof typeof CRYPTO_NETWORKS] || [];
  const isCrypto = selectedPaymentMethod === 'wallet_address';

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${description} copied to clipboard`,
    });
  };

  const calculateFiatValue = (cryptoAmount: string) => {
    if (!cryptoAmount || !currentMarketData) return "0.00";
    const amount = parseFloat(cryptoAmount);
    if (isNaN(amount)) return "0.00";
    
    switch (selectedFiatCurrency) {
      case 'NGN':
        return (amount * parseFloat(currentMarketData.priceNgn || '0')).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case 'ZAR':
        return (amount * parseFloat(currentMarketData.priceZar || '0')).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      default:
        return (amount * parseFloat(currentMarketData.priceUsd || '0')).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  };

  const getSelectedCurrency = () => {
    return FIAT_CURRENCIES.find(c => c.code === selectedFiatCurrency) || FIAT_CURRENCIES[0];
  };

  const generateDepositAddress = () => {
    if (!selectedCrypto || !selectedNetwork) return "";
    // This would normally generate a unique address for the user
    const sampleAddresses = {
      bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      ethereum: "0x742d35Cc6634C0532925a3b8d1f3c3a2e8B1a9e4",
      polygon: "0x742d35Cc6634C0532925a3b8d1f3c3a2e8B1a9e4",
      tron: "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs",
      solana: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"
    };
    return sampleAddresses[selectedNetwork as keyof typeof sampleAddresses] || "Address will be generated";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${type === 'deposit' ? 'bg-green-100' : 'bg-orange-100'}`}>
              {type === 'deposit' ? 
                <ArrowDownCircle className="w-6 h-6 text-green-600" /> : 
                <ArrowUpCircle className="w-6 h-6 text-orange-600" />
              }
            </div>
            <div>
              <span className="text-xl font-bold capitalize">{type} {selectedCrypto?.symbol}</span>
              <p className="text-sm text-gray-600">{selectedCrypto?.name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <>
              {/* Amount Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Amount</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount in {selectedCrypto?.symbol}</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00000000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-lg font-mono"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fiat-currency">Fiat Currency</Label>
                      <Select value={selectedFiatCurrency} onValueChange={setSelectedFiatCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIAT_CURRENCIES.map(currency => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.flag} {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Estimated Value</Label>
                      <div className="text-2xl font-bold text-green-600">
                        {getSelectedCurrency().symbol}{calculateFiatValue(amount)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="crypto" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="crypto">Crypto</TabsTrigger>
                      <TabsTrigger value="banking">Banking</TabsTrigger>
                      <TabsTrigger value="cards">Cards</TabsTrigger>
                      <TabsTrigger value="digital">Digital</TabsTrigger>
                      <TabsTrigger value="african">African</TabsTrigger>
                    </TabsList>
                    
                    {Object.entries(PAYMENT_METHODS).map(([category, methods]) => (
                      <TabsContent key={category} value={category} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {methods.map(method => (
                            <Card 
                              key={method.id}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedPaymentMethod === method.id ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                              }`}
                              onClick={() => setSelectedPaymentMethod(method.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <method.icon className="w-5 h-5 text-gray-600" />
                                    <div>
                                      <p className="font-medium">{method.name}</p>
                                      <p className="text-xs text-gray-500">Fee: {method.fees}</p>
                                    </div>
                                  </div>
                                  {selectedPaymentMethod === method.id && (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Network Selection for Crypto */}
              {isCrypto && cryptoNetworks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Network</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {cryptoNetworks.map(network => (
                        <Card 
                          key={network.network}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedNetwork === network.network ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                          }`}
                          onClick={() => setSelectedNetwork(network.network)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{network.name}</p>
                                <p className="text-xs text-gray-500">Fee: {network.fees} • Time: {network.time}</p>
                              </div>
                              {selectedNetwork === network.network && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!amount || !selectedPaymentMethod || (isCrypto && !selectedNetwork)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Transaction Summary and Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-bold">{amount} {selectedCrypto?.symbol}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Value</p>
                      <p className="font-bold">{getSelectedCurrency().symbol}{calculateFiatValue(amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium">{PAYMENT_METHODS.crypto.find(m => m.id === selectedPaymentMethod)?.name || 'Unknown'}</p>
                    </div>
                    {selectedNetwork && (
                      <div>
                        <p className="text-sm text-gray-600">Network</p>
                        <p className="font-medium">{cryptoNetworks.find(n => n.network === selectedNetwork)?.name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              {type === 'deposit' && isCrypto && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-orange-600" />
                      Deposit Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">Send only {selectedCrypto?.symbol} to this address</p>
                          <p className="text-sm text-blue-600">Sending other tokens may result in permanent loss</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Deposit Address</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-gray-50 border rounded-lg p-3">
                          <p className="font-mono text-sm break-all">{generateDepositAddress()}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(generateDepositAddress(), "Deposit address")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {selectedNetwork === 'ripple' && (
                      <div>
                        <Label>Destination Tag (Optional)</Label>
                        <Input 
                          value="123456789"
                          readOnly
                          className="font-mono mt-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {type === 'withdrawal' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Withdrawal Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="withdrawal-address">Destination Address</Label>
                      <Input
                        id="withdrawal-address"
                        placeholder="Enter destination address"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    {selectedNetwork === 'ripple' && (
                      <div>
                        <Label htmlFor="memo">Destination Tag (Optional)</Label>
                        <Input
                          id="memo"
                          placeholder="Enter destination tag if required"
                          value={memo}
                          onChange={(e) => setMemo(e.target.value)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={type === 'withdrawal' && !walletAddress}
                >
                  {type === 'deposit' ? 'I have sent the funds' : 'Confirm Withdrawal'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
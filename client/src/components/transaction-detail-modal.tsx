import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, 
  Eye, 
  EyeOff, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet,
  Calendar,
  DollarSign,
  FileText,
  CreditCard,
  Hash
} from "lucide-react";

interface TransactionDetailModalProps {
  transaction: any;
  open: boolean;
  onClose: () => void;
  marketData?: any[];
}

export function TransactionDetailModal({ 
  transaction, 
  open, 
  onClose, 
  marketData = [] 
}: TransactionDetailModalProps) {
  const { toast } = useToast();
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [showFullHash, setShowFullHash] = useState(false);

  if (!transaction) return null;

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${description} copied to clipboard`,
    });
  };

  const getTransactionTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case "buy":
      case "deposit":
      case "admin_credit":
        return { 
          icon: <ArrowUpCircle className="w-5 h-5 text-green-600" />, 
          color: "text-green-600", 
          bgColor: "bg-green-100",
          label: "Credit"
        };
      case "sell":
      case "withdrawal":
      case "admin_debit":
        return { 
          icon: <ArrowDownCircle className="w-5 h-5 text-red-600" />, 
          color: "text-red-600", 
          bgColor: "bg-red-100",
          label: "Debit"
        };
      default:
        return { 
          icon: <Wallet className="w-5 h-5 text-orange-600" />, 
          color: "text-orange-600", 
          bgColor: "bg-orange-100",
          label: "Pending"
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const typeInfo = getTransactionTypeInfo(transaction.type);

  // Get current market data for this crypto
  const currentMarketData = marketData.find(m => m.cryptoId === transaction.cryptoId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${typeInfo.bgColor}`}>
              {typeInfo.icon}
            </div>
            <div>
              <span className="text-xl font-bold">Transaction Details</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  {transaction.cryptocurrency?.symbol || `CRYPTO_${transaction.cryptoId}`}
                </Badge>
                {getStatusBadge(transaction.status)}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Summary */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                Transaction Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className={`text-2xl font-bold ${typeInfo.color}`}>
                    {transaction.type === "buy" || transaction.type === "admin_credit" ? "+" : "-"}
                    {parseFloat(transaction.amount).toFixed(8)} {transaction.cryptocurrency?.symbol || `CRYPTO_${transaction.cryptoId}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transaction Type</p>
                  <p className="text-lg font-semibold capitalize">{transaction.type}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {transaction.totalUsd && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">USD Value</p>
                    <p className="text-lg font-bold text-green-600">
                      ${parseFloat(transaction.totalUsd).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                )}
                {transaction.totalZar && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">ZAR Value</p>
                    <p className="text-lg font-bold text-blue-600">
                      R{parseFloat(transaction.totalZar).toLocaleString('en-ZA', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                )}
                {currentMarketData?.priceNgn && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">NGN Value</p>
                    <p className="text-lg font-bold text-purple-600">
                      ₦{(parseFloat(transaction.amount) * parseFloat(currentMarketData.priceNgn)).toLocaleString('en-NG', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Transaction Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm">{transaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm">{new Date(transaction.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {transaction.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-sm bg-gray-50 p-2 rounded">{transaction.description}</p>
                </div>
              )}

              {(transaction.paymentMethod || transaction.payment_method) && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <p className="text-sm capitalize">{transaction.paymentMethod || transaction.payment_method}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wallet & Blockchain Information */}
          {((transaction.walletAddress || transaction.wallet_address) || (transaction.transactionHash || transaction.transaction_hash)) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-orange-600" />
                  Wallet & Blockchain Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(transaction.walletAddress || transaction.wallet_address) && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Wallet Address</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3">
                        <p className="font-mono text-sm break-all text-orange-800">
                          {showFullAddress 
                            ? (transaction.walletAddress || transaction.wallet_address)
                            : `${(transaction.walletAddress || transaction.wallet_address).substring(0, 20)}...${(transaction.walletAddress || transaction.wallet_address).substring(-10)}`
                          }
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFullAddress(!showFullAddress)}
                        className="flex items-center gap-2"
                      >
                        {showFullAddress ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showFullAddress ? "Hide" : "Show"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.walletAddress || transaction.wallet_address, "Wallet address")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {(transaction.transactionHash || transaction.transaction_hash) && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="font-mono text-sm break-all text-gray-800">
                          {showFullHash 
                            ? (transaction.transactionHash || transaction.transaction_hash)
                            : `${(transaction.transactionHash || transaction.transaction_hash).substring(0, 20)}...${(transaction.transactionHash || transaction.transaction_hash).substring(-10)}`
                          }
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFullHash(!showFullHash)}
                        className="flex items-center gap-2"
                      >
                        {showFullHash ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showFullHash ? "Hide" : "Show"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.transactionHash || transaction.transaction_hash, "Transaction hash")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Current Market Data */}
          {currentMarketData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Current Market Prices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">USD Price</p>
                    <p className="text-xl font-bold text-green-600">
                      ${parseFloat(currentMarketData.priceUsd).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">ZAR Price</p>
                    <p className="text-xl font-bold text-blue-600">
                      R{parseFloat(currentMarketData.priceZar).toLocaleString('en-ZA', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                  {currentMarketData.priceNgn && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">NGN Price</p>
                      <p className="text-xl font-bold text-purple-600">
                        ₦{parseFloat(currentMarketData.priceNgn).toLocaleString('en-NG', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
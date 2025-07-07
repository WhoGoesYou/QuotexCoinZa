import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { TransactionWithCrypto } from "@shared/schema";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CreditCard, 
  Banknote, 
  Wallet, 
  Building2,
  Zap,
  Copy,
  ExternalLink,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransactionHistoryProps {
  transactions: (TransactionWithCrypto & {
    wallet_address?: string;
    transaction_hash?: string;
    payment_method?: string;
  })[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const { toast } = useToast();

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

  const getTransactionIcon = (type: string, paymentMethod?: string) => {
    switch (type) {
      case "deposit":
      case "admin_credit":
        return <ArrowDownCircle className="w-5 h-5 text-green-600" />;
      case "withdrawal":
        return <ArrowUpCircle className="w-5 h-5 text-red-600" />;
      case "buy":
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case "sell":
        return <TrendingDown className="w-5 h-5 text-orange-600" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPaymentMethodIcon = (paymentMethod?: string) => {
    switch (paymentMethod) {
      case "credit_card":
      case "debit_card":
        return <CreditCard className="w-4 h-4" />;
      case "bank_transfer":
      case "wire_transfer":
        return <Building2 className="w-4 h-4" />;
      case "ach":
        return <Zap className="w-4 h-4" />;
      case "wallet_address":
        return <Wallet className="w-4 h-4" />;
      default:
        return <Banknote className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPaymentMethod = (paymentMethod?: string) => {
    if (!paymentMethod) return "N/A";
    return paymentMethod.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case "admin_credit":
        return "Admin Credit";
      case "admin_debit":
        return "Admin Debit";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Transaction History</h3>
          <p className="text-muted-foreground">
            Your transaction history will appear here once you start trading.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Transaction History ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <div key={transaction.id}>
              <div className="flex items-start justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Transaction Icon */}
                  <div className="mt-1">
                    {getTransactionIcon(transaction.type, transaction.paymentMethod || undefined)}
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatTransactionType(transaction.type)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.cryptocurrency.symbol}
                      </Badge>
                      {getStatusBadge(transaction.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Amount:</span>
                        <span>{parseFloat(transaction.amount).toFixed(8)} {transaction.cryptocurrency.symbol}</span>
                      </div>
                      
                      {(transaction.paymentMethod || transaction.payment_method) && (
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(transaction.paymentMethod || transaction.payment_method)}
                          <span className="font-medium">Method:</span>
                          <span>{formatPaymentMethod(transaction.paymentMethod || transaction.payment_method)}</span>
                        </div>
                      )}
                      
                      {transaction.description && (
                        <div className="flex items-start gap-2">
                          <span className="font-medium">Note:</span>
                          <span className="text-xs">{transaction.description}</span>
                        </div>
                      )}
                      
                      {(transaction.walletAddress || transaction.wallet_address) && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">To Address:</span>
                          <span className="font-mono text-xs">
                            {(transaction.walletAddress || transaction.wallet_address).substring(0, 20)}...
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard((transaction.walletAddress || transaction.wallet_address)!, "Wallet address")}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      
                      {(transaction.transactionHash || transaction.transaction_hash) && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">TX Hash:</span>
                          <span className="font-mono text-xs">
                            {(transaction.transactionHash || transaction.transaction_hash).substring(0, 16)}...
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard((transaction.transactionHash || transaction.transaction_hash)!, "Transaction hash")}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {/* Transaction Values */}
                <div className="text-right space-y-1">
                  <div className={`font-bold text-lg ${
                    transaction.type === "deposit" || transaction.type === "admin_credit" || transaction.type === "buy"
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {transaction.type === "deposit" || transaction.type === "admin_credit" || transaction.type === "buy" ? "+" : "-"}
                    {parseFloat(transaction.amount).toFixed(8)} {transaction.cryptocurrency.symbol}
                  </div>
                  
                  {transaction.totalUsd && (
                    <div className="text-sm text-green-600">
                      ${parseFloat(transaction.totalUsd).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </div>
                  )}
                  
                  {transaction.totalZar && (
                    <div className="text-sm text-blue-600">
                      R{parseFloat(transaction.totalZar).toLocaleString('en-ZA', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </div>
                  )}
                  
                  {transaction.price && (
                    <div className="text-xs text-gray-500">
                      @ ${parseFloat(transaction.price).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {index < transactions.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
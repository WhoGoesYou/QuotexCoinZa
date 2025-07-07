import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FixedModal } from "@/components/ui/fixed-modal";
import { SimpleAdminForm } from "./simple-admin-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Search, 
  Plus, 
  Minus, 
  Eye, 
  UserPlus, 
  Wallet, 
  Activity,
  CreditCard,
  MapPin,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign
} from "lucide-react";

interface UserManagementProps {
  users: any[];
  isLoading: boolean;
}

export default function UserManagement({ users, isLoading }: UserManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [debitAmount, setDebitAmount] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState<number | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState<"credit" | "debit" | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  // Separate state for detail dialog to avoid conflicts
  const [detailSelectedCrypto, setDetailSelectedCrypto] = useState<number | null>(null);
  const [detailCreditAmount, setDetailCreditAmount] = useState("");
  const [detailDebitAmount, setDetailDebitAmount] = useState("");

  // Fetch market data for accurate conversions
  const { data: marketData } = useQuery({
    queryKey: ["/api/market-data"],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Create a map of crypto symbols to market data
  const marketDataMap = marketData?.reduce((acc: any, item: any) => {
    const crypto = item.cryptocurrency || {};
    acc[crypto.symbol] = item;
    return acc;
  }, {}) || {};

  const creditMutation = useMutation({
    mutationFn: async ({ userId, cryptoId, amount }: { userId: string; cryptoId: number; amount: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cryptoId, amount }),
      });
      if (!response.ok) throw new Error('Failed to credit user');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User balance credited successfully" });
      setActionDialogOpen(null);
      setCreditAmount("");
      setSelectedCrypto(null);
      setShowAdminForm(false);

      // Force refresh user data with updated balances
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        if (selectedUser) {
          queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${selectedUser.id}/transactions`] });
        }
      }, 500);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to credit user balance", variant: "destructive" });
    },
  });

  const debitMutation = useMutation({
    mutationFn: async ({ userId, cryptoId, amount }: { userId: string; cryptoId: number; amount: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/debit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cryptoId, amount }),
      });
      if (!response.ok) throw new Error('Failed to debit user');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User balance debited successfully" });
      setActionDialogOpen(null);
      setDebitAmount("");
      setSelectedCrypto(null);
      setShowAdminForm(false);

      // Force refresh user data with updated balances
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        if (selectedUser) {
          queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${selectedUser.id}/transactions`] });
        }
      }, 500);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to debit user balance", variant: "destructive" });
    },
  });

  const filteredUsers = users.filter((user) =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCredit = () => {
    if (!selectedUser || !selectedCrypto || !creditAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    creditMutation.mutate({
      userId: selectedUser.id,
      cryptoId: selectedCrypto,
      amount: creditAmount,
    });
  };

  const handleDebit = () => {
    if (!selectedUser || !selectedCrypto || !debitAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    debitMutation.mutate({
      userId: selectedUser.id,
      cryptoId: selectedCrypto,
      amount: debitAmount,
    });
  };

  // Bulk credit function to distribute $70,000 across all cryptocurrencies
  const handleBulkCredit = async (user: any) => {
    const totalUSD = 70000;
    const cryptos = user.wallets || [];

    if (cryptos.length === 0) {
      toast({
        title: "No Wallets Found",
        description: "User has no cryptocurrency wallets.",
        variant: "destructive",
      });
      return;
    }

    // Distribute equally across all cryptos
    const amountPerCrypto = totalUSD / cryptos.length;

    try {
      // Process each cryptocurrency
      for (const wallet of cryptos) {
        const cryptoSymbol = wallet.cryptocurrency.symbol;
        const marketInfo = marketDataMap[cryptoSymbol];

        if (marketInfo) {
          const priceUsd = parseFloat(marketInfo.priceUsd);
          const cryptoAmount = amountPerCrypto / priceUsd;

          await apiRequest("POST", `/api/admin/users/${user.id}/credit`, {
            cryptoId: wallet.cryptocurrency.id,
            amount: cryptoAmount.toString(),
          });
        }
      }

      toast({
        title: "Bulk Credit Successful",
        description: `Successfully credited $${totalUSD.toLocaleString()} across all cryptocurrencies.`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });

    } catch (error: any) {
      console.error("Bulk credit error:", error);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Bulk Credit Failed",
        description: error.message || "Failed to credit user balances. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Separate handlers for detail dialog to avoid conflicts
  const handleDetailCredit = () => {
    if (!selectedUser || !detailSelectedCrypto || !detailCreditAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate amount
    const amount = parseFloat(detailCreditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }

    creditMutation.mutate({
      userId: selectedUser.id,
      cryptoId: detailSelectedCrypto,
      amount: detailCreditAmount,
    });
  };

  const handleDetailDebit = () => {
    if (!selectedUser || !detailSelectedCrypto || !detailDebitAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate amount
    const amount = parseFloat(detailDebitAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }

    debitMutation.mutate({
      userId: selectedUser.id,
      cryptoId: detailSelectedCrypto,
      amount: detailDebitAmount,
    });
  };

  const calculateTotalBalance = (user: any) => {
    return user.wallets?.reduce((total: number, wallet: any) => {
      const cryptoSymbol = wallet.cryptocurrency?.symbol;
      const marketInfo = marketDataMap[cryptoSymbol];
      const priceZar = marketInfo ? parseFloat(marketInfo.priceZar) : 0;
      const balance = parseFloat(wallet.balance || "0");
      return total + (balance * priceZar);
    }, 0) || 0;
  };

  const calculateCryptoValueUSD = (balance: string, symbol: string) => {
    const marketInfo = marketDataMap[symbol];
    const priceUsd = marketInfo ? parseFloat(marketInfo.priceUsd) : 0;
    return parseFloat(balance || "0") * priceUsd;
  };

  const calculateCryptoValueZAR = (balance: string, symbol: string) => {
    const marketInfo = marketDataMap[symbol];
    const priceZar = marketInfo ? parseFloat(marketInfo.priceZar) : 0;
    return parseFloat(balance || "0") * priceZar;
  };

  const formatCryptoBalance = (balance: string, symbol: string) => {
    const numBalance = parseFloat(balance);
    if (numBalance === 0) return "0";
    if (numBalance < 0.001) return numBalance.toFixed(8);
    return numBalance.toFixed(4);
  };

  // Highlight featured user (HANLIE DOROTHEA THERON)
  const featuredUser = users.find(user => 
    user.email?.toLowerCase() === "hanlietheron13@gmail.com"
  );

  // Fetch user transaction history
  const { data: userTransactions } = useQuery({
    queryKey: [`/api/admin/users/${selectedUser?.id}/transactions`],
    enabled: !!selectedUser,
    staleTime: 30 * 1000,
  });

  const handleAdminFormSuccess = (userId: number) => {
    // Redirect to user details after successful operation
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setSelectedUser(targetUser);
      setUserDetailsOpen(true);
    }
  };

  const UserDetailDialog = ({ user, open, onClose }: { user: any, open: boolean, onClose: () => void }) => {
    if (!user || !open) return null;

    return <SimpleAdminForm 
      user={user} 
      onClose={onClose} 
      onSuccess={handleAdminFormSuccess}
    />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Featured User First */}
            {featuredUser && (
              <div 
                className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedUser(featuredUser);
                  setUserDetailsOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={featuredUser.profileImageUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white font-semibold">
                        {featuredUser.firstName?.[0] || 'H'}{featuredUser.lastName?.[0] || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-gray-900">
                          {featuredUser.firstName} {featuredUser.lastName}
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Featured User
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">{featuredUser.email}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        🇿🇦 Johannesburg, South Africa ZA
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      R{calculateTotalBalance(featuredUser).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      {featuredUser.wallets?.slice(0, 3).map((wallet: any) => (
                        <div key={wallet.id} className="flex justify-between">
                          <span>{wallet.cryptocurrency.symbol}:</span>
                          <span>{formatCryptoBalance(wallet.balance, wallet.cryptocurrency.symbol)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Since {new Date(featuredUser.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(featuredUser);
                        setActionDialogOpen("credit");
                      }}
                      title="Credit Account"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(featuredUser);
                        setActionDialogOpen("debit");
                      }}
                      title="Debit Account"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBulkCredit(featuredUser);
                      }}
                      title="Credit $70K to All Cryptos"
                    >
                      <DollarSign className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(featuredUser);
                        setUserDetailsOpen(true);
                      }}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Other Users */}
            {filteredUsers.filter(user => user.id !== featuredUser?.id).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                      {user.firstName?.[0] || 'U'}{user.lastName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      {user.isAdmin && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      🇿🇦 Johannesburg, South Africa ZA
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    R{calculateTotalBalance(user).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    {user.wallets?.slice(0, 2).map((wallet: any) => (
                      <div key={wallet.id} className="flex justify-between">
                        <span>{wallet.cryptocurrency.symbol}:</span>
                        <span>{formatCryptoBalance(wallet.balance, wallet.cryptocurrency.symbol)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => {
                      setSelectedUser(user);
                      setActionDialogOpen("credit");
                    }}
                    title="Credit Account"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    onClick={() => {
                      setSelectedUser(user);
                      setActionDialogOpen("debit");
                    }}
                    title="Debit Account"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      setSelectedUser(user);
                      setUserDetailsOpen(true);
                    }}
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
                <p className="text-sm text-gray-400">
                  {searchTerm ? "Try adjusting your search terms" : "No users have been registered yet"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Credit Dialog */}
        <Dialog open={actionDialogOpen === "credit"} onOpenChange={(open) => !open && setActionDialogOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                <span>Credit User Balance</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <div className="p-2 bg-gray-50 rounded">
                  {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.email})
                </div>
              </div>
              <div>
                <Label htmlFor="crypto-select">Cryptocurrency</Label>
                <Select onValueChange={(value) => setSelectedCrypto(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedUser?.wallets?.map((wallet: any) => (
                      <SelectItem key={wallet.cryptocurrency.id} value={wallet.cryptocurrency.id.toString()}>
                        {wallet.cryptocurrency.name} ({wallet.cryptocurrency.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="credit-amount">Amount</Label>
                <Input
                  id="credit-amount"
                  type="number"
                  placeholder="0.00"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setActionDialogOpen(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCredit}
                  disabled={creditMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {creditMutation.isPending ? "Processing..." : "Credit Account"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Debit Dialog */}
        <Dialog open={actionDialogOpen === "debit"} onOpenChange={(open) => !open && setActionDialogOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <span>Debit User Balance</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <div className="p-2 bg-gray-50 rounded">
                  {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.email})
                </div>
              </div>
              <div>
                <Label htmlFor="crypto-select-debit">Cryptocurrency</Label>
                <Select onValueChange={(value) => setSelectedCrypto(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedUser?.wallets?.map((wallet: any) => (
                      <SelectItem key={wallet.cryptocurrency.id} value={wallet.cryptocurrency.id.toString()}>
                        {wallet.cryptocurrency.name} ({wallet.cryptocurrency.symbol}) - Balance: {formatCryptoBalance(wallet.balance, wallet.cryptocurrency.symbol)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="debit-amount">Amount</Label>
                <Input
                  id="debit-amount"
                  type="number"
                  placeholder="0.00"
                  value={debitAmount}
                  onChange={(e) => setDebitAmount(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setActionDialogOpen(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDebit}
                  disabled={debitMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {debitMutation.isPending ? "Processing..." : "Debit Account"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced User Details Modal with Transaction History */}
        <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>User Details - {selectedUser?.firstName} {selectedUser?.lastName}</span>
              </DialogTitle>
            </DialogHeader>
            
            {selectedUser && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                  <TabsTrigger value="actions">Admin Actions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>User Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={selectedUser.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-lg">
                              {selectedUser.firstName?.[0] || 'U'}{selectedUser.lastName?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{selectedUser.firstName} {selectedUser.lastName}</h3>
                            <p className="text-gray-600">{selectedUser.email}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              🇿🇦 Johannesburg, South Africa ZA
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Join Date</Label>
                            <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Status</Label>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Portfolio Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900">
                              R{calculateTotalBalance(selectedUser).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <p className="text-sm text-gray-500">Total Portfolio Value</p>
                          </div>
                          
                          <div className="space-y-2">
                            {selectedUser.wallets?.map((wallet: any) => (
                              <div key={wallet.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-600 font-bold text-xs">
                                      {wallet.cryptocurrency.symbol}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{wallet.cryptocurrency.name}</p>
                                    <p className="text-xs text-gray-500">{formatCryptoBalance(wallet.balance, wallet.cryptocurrency.symbol)} {wallet.cryptocurrency.symbol}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">${calculateCryptoValueUSD(wallet.balance, wallet.cryptocurrency.symbol).toLocaleString()}</p>
                                  <p className="text-xs text-gray-500">R{calculateCryptoValueZAR(wallet.balance, wallet.cryptocurrency.symbol).toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="transactions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction History (2024 - Present)</CardTitle>
                      <p className="text-sm text-gray-500">Complete trading history from 2024 to present</p>
                    </CardHeader>
                    <CardContent>
                      {userTransactions && userTransactions.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {userTransactions.map((transaction: any) => (
                            <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  transaction.type === 'BUY' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                  {transaction.type === 'BUY' ? '+' : '-'}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{transaction.type}</span>
                                    <span className="text-sm text-gray-500">{transaction.cryptocurrency.symbol}</span>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.paymentMethod || 'Bank Transfer'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {parseFloat(transaction.amount).toFixed(6)} {transaction.cryptocurrency.symbol}
                                </div>
                                <div className="text-sm text-gray-500">
                                  R{parseFloat(transaction.totalZar).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No transactions found</p>
                          <p className="text-sm text-gray-400">This user hasn't made any transactions yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="actions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Actions</CardTitle>
                      <p className="text-sm text-gray-500">Credit or debit user cryptocurrency balances</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 text-green-600">Credit Balance</h4>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="detail-crypto-credit">Cryptocurrency</Label>
                              <Select onValueChange={(value) => setDetailSelectedCrypto(parseInt(value))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select cryptocurrency" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedUser.wallets?.map((wallet: any) => (
                                    <SelectItem key={wallet.cryptocurrency.id} value={wallet.cryptocurrency.id.toString()}>
                                      {wallet.cryptocurrency.name} ({wallet.cryptocurrency.symbol})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="detail-credit-amount">Amount</Label>
                              <Input
                                id="detail-credit-amount"
                                type="number"
                                placeholder="0.00"
                                value={detailCreditAmount}
                                onChange={(e) => setDetailCreditAmount(e.target.value)}
                              />
                            </div>
                            <Button 
                              onClick={handleDetailCredit}
                              disabled={creditMutation.isPending}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              {creditMutation.isPending ? "Processing..." : "Credit Account"}
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3 text-orange-600">Debit Balance</h4>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="detail-crypto-debit">Cryptocurrency</Label>
                              <Select onValueChange={(value) => setDetailSelectedCrypto(parseInt(value))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select cryptocurrency" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedUser.wallets?.map((wallet: any) => (
                                    <SelectItem key={wallet.cryptocurrency.id} value={wallet.cryptocurrency.id.toString()}>
                                      {wallet.cryptocurrency.name} ({wallet.cryptocurrency.symbol}) - Balance: {formatCryptoBalance(wallet.balance, wallet.cryptocurrency.symbol)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="detail-debit-amount">Amount</Label>
                              <Input
                                id="detail-debit-amount"
                                type="number"
                                placeholder="0.00"
                                value={detailDebitAmount}
                                onChange={(e) => setDetailDebitAmount(e.target.value)}
                              />
                            </div>
                            <Button 
                              onClick={handleDetailDebit}
                              disabled={debitMutation.isPending}
                              className="w-full bg-orange-600 hover:bg-orange-700"
                            >
                              {debitMutation.isPending ? "Processing..." : "Debit Account"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
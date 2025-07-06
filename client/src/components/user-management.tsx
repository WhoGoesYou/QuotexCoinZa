import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
  MapPin
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

  const creditMutation = useMutation({
    mutationFn: async ({ userId, cryptoId, amount }: { userId: string; cryptoId: number; amount: string }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/credit`, { cryptoId, amount });
    },
    onSuccess: () => {
      toast({
        title: "Credit Successful",
        description: "User balance has been credited successfully.",
      });
      setCreditAmount("");
      setSelectedCrypto(null);
      setActionDialogOpen(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
        title: "Credit Failed",
        description: "Failed to credit user balance. Please try again.",
        variant: "destructive",
      });
    },
  });

  const debitMutation = useMutation({
    mutationFn: async ({ userId, cryptoId, amount }: { userId: string; cryptoId: number; amount: string }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/debit`, { cryptoId, amount });
    },
    onSuccess: () => {
      toast({
        title: "Debit Successful",
        description: "User balance has been debited successfully.",
      });
      setDebitAmount("");
      setSelectedCrypto(null);
      setActionDialogOpen(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
        title: "Debit Failed",
        description: "Failed to debit user balance. Please try again.",
        variant: "destructive",
      });
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

  const calculateTotalBalance = (user: any) => {
    return user.wallets?.reduce((total: number, wallet: any) => {
      // For demonstration, we'll use a fixed conversion rate
      // In production, this would use real market data
      const conversionRates: Record<string, number> = {
        "BTC": 1847892.45,
        "ETH": 43295.68,
        "XRP": 38.56,
        "SOL": 2574.85,
        "USDT": 17.00,
        "USDC": 17.00,
      };
      
      const rate = conversionRates[wallet.cryptocurrency.symbol] || 0;
      return total + (parseFloat(wallet.balance) * rate);
    }, 0) || 0;
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
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
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
                        🇿🇦 {featuredUser.city}, {featuredUser.country}
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
                      onClick={() => {
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
                      onClick={() => {
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
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
                      🇿🇦 {user.city}, {user.country}
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
      </CardContent>
    </Card>
  );
}

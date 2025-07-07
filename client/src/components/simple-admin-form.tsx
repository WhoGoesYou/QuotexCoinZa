import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SimpleAdminFormProps {
  user: any;
  onClose: () => void;
}

export function SimpleAdminForm({ user, onClose }: SimpleAdminFormProps) {
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [amount, setAmount] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const creditMutation = useMutation({
    mutationFn: async (data: { cryptoId: string; amount: string }) => {
      console.log('Submitting credit:', data);
      const response = await fetch(`/api/admin/users/${user.id}/credit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cryptoId: parseInt(data.cryptoId),
          amount: data.amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Credit failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Balance credited successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCrypto || !amount) {
      toast({
        title: "Missing Information",
        description: "Please select crypto and enter amount",
        variant: "destructive",
      });
      return;
    }

    creditMutation.mutate({ cryptoId: selectedCrypto, amount });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>

        <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
          Credit Balance - {user.firstName} {user.lastName}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Select Cryptocurrency:
            </label>
            <select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #ccc',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            >
              <option value="">Choose cryptocurrency</option>
              {user?.wallets?.map((wallet: any) => (
                <option key={wallet.cryptocurrency.id} value={wallet.cryptocurrency.id}>
                  {wallet.cryptocurrency.name} ({wallet.cryptocurrency.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Amount:
            </label>
            <input
              type="number"
              step="0.00000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #ccc',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={creditMutation.isPending}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: creditMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: creditMutation.isPending ? 0.5 : 1
            }}
          >
            {creditMutation.isPending ? 'Processing...' : 'Credit Balance'}
          </button>
        </form>
      </div>
    </div>
  );
}
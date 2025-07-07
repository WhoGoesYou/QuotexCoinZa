import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SimpleAdminFormProps {
  user: any;
  onClose: () => void;
  onSuccess?: (userId: number) => void;
}

export function SimpleAdminForm({ user, onClose, onSuccess }: SimpleAdminFormProps) {
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('credit');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const creditMutation = useMutation({
    mutationFn: async (data: { cryptoId: string; amount: string; action: string }) => {
      console.log('Submitting operation:', data);
      const endpoint = action === 'credit' ? 'credit' : 'debit';
      const response = await fetch(`/api/admin/users/${user.id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cryptoId: parseInt(data.cryptoId),
          amount: data.amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `${action} failed`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Balance ${action === 'credit' ? 'credited' : 'debited'} successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      
      // Auto-close and redirect after successful operation
      setTimeout(() => {
        onClose();
        if (onSuccess) {
          onSuccess(user.id);
        }
      }, 1000);
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

    if (parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    creditMutation.mutate({ cryptoId: selectedCrypto, amount, action });
  };

  const cryptoOptions = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC' },
    { id: 2, name: 'Ethereum', symbol: 'ETH' },
    { id: 3, name: 'XRP', symbol: 'XRP' },
    { id: 4, name: 'Solana', symbol: 'SOL' },
    { id: 5, name: 'Tether', symbol: 'USDT' },
    { id: 6, name: 'USD Coin', symbol: 'USDC' },
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        position: 'relative',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        color: 'white'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#94a3b8',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            e.target.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#94a3b8';
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            marginBottom: '10px', 
            fontSize: '28px', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {action === 'credit' ? 'Credit Balance' : 'Debit Balance'} - {user.firstName} {user.lastName}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            📍 Johannesburg, South Africa ZA
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#e2e8f0' }}>
              Action:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setAction('credit')}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  backgroundColor: action === 'credit' ? '#22c55e' : 'rgba(34, 197, 94, 0.1)',
                  color: action === 'credit' ? 'white' : '#22c55e',
                  border: `2px solid ${action === 'credit' ? '#22c55e' : 'rgba(34, 197, 94, 0.3)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Credit (+)
              </button>
              <button
                type="button"
                onClick={() => setAction('debit')}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  backgroundColor: action === 'debit' ? '#ef4444' : 'rgba(239, 68, 68, 0.1)',
                  color: action === 'debit' ? 'white' : '#ef4444',
                  border: `2px solid ${action === 'debit' ? '#ef4444' : 'rgba(239, 68, 68, 0.3)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Debit (-)
              </button>
            </div>
          </div>

          {/* Cryptocurrency Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#e2e8f0' }}>
              Select Cryptocurrency:
            </label>
            <select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                fontSize: '16px',
                color: 'white'
              }}
            >
              <option value="">Choose cryptocurrency</option>
              {cryptoOptions.map(crypto => (
                <option key={crypto.id} value={crypto.id.toString()}>
                  {crypto.name} ({crypto.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#e2e8f0' }}>
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
                padding: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                fontSize: '16px',
                color: 'white'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={creditMutation.isPending}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: creditMutation.isPending ? '#6b7280' : (action === 'credit' ? '#22c55e' : '#ef4444'),
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: creditMutation.isPending ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: creditMutation.isPending ? 'none' : `0 4px 14px 0 ${action === 'credit' ? 'rgba(34, 197, 94, 0.39)' : 'rgba(239, 68, 68, 0.39)'}`
            }}
          >
            {creditMutation.isPending ? 'Processing...' : `${action === 'credit' ? 'Credit' : 'Debit'} Balance`}
          </button>
        </form>
      </div>
    </div>
  );
}
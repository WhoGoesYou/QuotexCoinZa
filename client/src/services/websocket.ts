interface WebSocketMessage {
  type: string;
  data?: any;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting = false;
  private userId: string | null = null;
  private isAdmin = false;

  connect(userId: string, isAdmin: boolean = false) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    this.userId = userId;
    this.isAdmin = isAdmin;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Authenticate with the server
        this.send({
          type: 'authenticate',
          data: { userId: this.userId, isAdmin: this.isAdmin }
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.ws = null;
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.userId = null;
    this.isAdmin = false;
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId, this.isAdmin);
      }
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  private send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('WebSocket message received:', message);
    
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(message.data);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }

    // Handle built-in message types
    switch (message.type) {
      case 'authenticated':
        console.log('WebSocket authenticated successfully');
        break;
      case 'market_data_update':
        this.notifyListeners('market_data_update', message.data);
        break;
      case 'balance_update':
        this.notifyListeners('balance_update', message.data);
        break;
      case 'transaction_update':
        this.notifyListeners('transaction_update', message.data);
        break;
      case 'admin_notification':
        if (this.isAdmin) {
          this.notifyListeners('admin_notification', message.data);
        }
        break;
      default:
        // Handle unknown message types
        this.notifyListeners(message.type, message.data);
        break;
    }
  }

  private notifyListeners(type: string, data: any) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in ${type} listener:`, error);
        }
      });
    }
  }

  // Public API for subscribing to events
  on(type: string, listener: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  // Remove all listeners for a specific event type
  off(type: string) {
    this.listeners.delete(type);
  }

  // Get connection status
  get isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  get connectionState() {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'DISCONNECTED';
      default:
        return 'UNKNOWN';
    }
  }

  // Send custom messages (for admin or advanced features)
  sendMessage(type: string, data?: any) {
    this.send({ type, data });
  }

  // Specific methods for common actions
  requestMarketDataUpdate() {
    this.send({ type: 'request_market_data' });
  }

  requestBalanceUpdate() {
    this.send({ type: 'request_balance_update' });
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

// Export types for use in components
export type { WebSocketMessage };

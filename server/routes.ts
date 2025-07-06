import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTransactionSchema, insertWalletSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketMessage {
  type: string;
  data?: any;
}

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  isAdmin?: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default data
  await storage.initializeDefaultData();

  // Temporarily disable auth setup to fix connection issues
  // TODO: Re-enable once Replit environment is properly configured
  // await setupAuth(app);

  // Simple auth bypass for demo purposes
  app.post('/api/demo/login', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }
    
    try {
      // Create or get demo user
      const demoUser = await storage.upsertUser({
        id: `demo_${Date.now()}`,
        email: email,
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null
      });
      
      res.json({ 
        success: true, 
        user: demoUser,
        message: "Demo login successful" 
      });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ message: "Failed to create demo user" });
    }
  });

  // Demo auth status
  app.get('/api/auth/user', async (req, res) => {
    // Return null to indicate not authenticated (shows landing page)
    res.status(401).json({ message: "Unauthorized" });
  });

  // Test route to view cryptocurrencies
  app.get('/api/test/cryptocurrencies', async (req, res) => {
    try {
      const cryptos = await storage.getCryptocurrencies();
      res.json(cryptos);
    } catch (error) {
      console.error("Error fetching cryptocurrencies:", error);
      res.status(500).json({ message: "Failed to fetch cryptocurrencies" });
    }
  });

  // User routes
  app.get('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const wallets = await storage.getUserWallets(userId);
      const zarBalance = await storage.getUserZarBalance(userId);
      const transactions = await storage.getUserTransactions(userId);
      
      res.json({
        ...user,
        wallets,
        zarBalance,
        transactions: transactions.slice(0, 50), // Limit to last 50 transactions
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Wallet routes
  app.get('/api/wallets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallets = await storage.getUserWallets(userId);
      res.json(wallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  app.post('/api/wallets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const walletData = insertWalletSchema.parse({ ...req.body, userId });
      const wallet = await storage.createWallet(walletData);
      res.json(wallet);
    } catch (error) {
      console.error("Error creating wallet:", error);
      res.status(500).json({ message: "Failed to create wallet" });
    }
  });

  // Cryptocurrency routes
  app.get('/api/cryptocurrencies', async (req, res) => {
    try {
      const cryptocurrencies = await storage.getCryptocurrencies();
      res.json(cryptocurrencies);
    } catch (error) {
      console.error("Error fetching cryptocurrencies:", error);
      res.status(500).json({ message: "Failed to fetch cryptocurrencies" });
    }
  });

  // Market data routes
  app.get('/api/market-data', async (req, res) => {
    try {
      const marketData = await storage.getMarketData();
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionData = insertTransactionSchema.parse({ ...req.body, userId });
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users/:targetUserId/credit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { targetUserId } = req.params;
      const { cryptoId, amount } = req.body;
      
      const schema = z.object({
        cryptoId: z.number(),
        amount: z.string(),
      });
      
      const validated = schema.parse({ cryptoId, amount });
      
      await storage.creditUserBalance(targetUserId, validated.cryptoId, validated.amount, userId);
      
      res.json({ message: "User balance credited successfully" });
    } catch (error) {
      console.error("Error crediting user balance:", error);
      res.status(500).json({ message: "Failed to credit user balance" });
    }
  });

  app.post('/api/admin/users/:targetUserId/debit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { targetUserId } = req.params;
      const { cryptoId, amount } = req.body;
      
      const schema = z.object({
        cryptoId: z.number(),
        amount: z.string(),
      });
      
      const validated = schema.parse({ cryptoId, amount });
      
      await storage.debitUserBalance(targetUserId, validated.cryptoId, validated.amount, userId);
      
      res.json({ message: "User balance debited successfully" });
    } catch (error) {
      console.error("Error debiting user balance:", error);
      res.status(500).json({ message: "Failed to debit user balance" });
    }
  });

  app.get('/api/admin/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching admin transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients = new Map<string, ExtendedWebSocket[]>();

  wss.on('connection', (ws: ExtendedWebSocket, req) => {
    console.log('WebSocket connection established');

    ws.on('message', async (message: Buffer) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());
        
        if (data.type === 'authenticate') {
          // In a real implementation, you would validate the token here
          ws.userId = data.data.userId;
          ws.isAdmin = data.data.isAdmin;
          
          // Add to clients map
          if (!clients.has(ws.userId)) {
            clients.set(ws.userId, []);
          }
          clients.get(ws.userId)!.push(ws);
          
          ws.send(JSON.stringify({ type: 'authenticated', data: { success: true } }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Remove from clients map
      if (ws.userId) {
        const userClients = clients.get(ws.userId) || [];
        const index = userClients.indexOf(ws);
        if (index > -1) {
          userClients.splice(index, 1);
        }
        if (userClients.length === 0) {
          clients.delete(ws.userId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Function to broadcast updates to specific user
  const broadcastToUser = (userId: string, message: WebSocketMessage) => {
    const userClients = clients.get(userId) || [];
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  // Function to broadcast updates to all admin users
  const broadcastToAdmins = (message: WebSocketMessage) => {
    clients.forEach((userClients, userId) => {
      userClients.forEach(client => {
        if (client.isAdmin && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    });
  };

  // Simulate real-time market data updates
  setInterval(async () => {
    try {
      const marketData = await storage.getMarketData();
      const message: WebSocketMessage = {
        type: 'market_data_update',
        data: marketData,
      };
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    } catch (error) {
      console.error('Error broadcasting market data:', error);
    }
  }, 30000); // Update every 30 seconds

  return httpServer;
}

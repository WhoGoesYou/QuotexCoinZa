import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { getSession, isAuthenticated, isAdmin, registerUser, loginUser, registerAdmin, loginAdmin } from "./auth";
import { insertTransactionSchema, insertWalletSchema, registerUserSchema, loginUserSchema, registerAdminSchema, loginAdminSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketMessage {
  type: string;
  data?: any;
}

interface ExtendedWebSocket extends WebSocket {
  userId?: number;
  isAdmin?: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default data
  await storage.initializeDefaultData();

  // Session middleware
  app.use(getSession());

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      const user = await registerUser(userData);
      req.session.userId = user.id;
      res.json({ 
        message: "Registration successful", 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName 
        } 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const credentials = loginUserSchema.parse(req.body);
      const user = await loginUser(credentials);
      req.session.userId = user.id;
      res.json({ 
        message: "Login successful", 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        } 
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin auth routes
  app.post('/api/admin/auth/register', async (req, res) => {
    try {
      const adminData = registerAdminSchema.parse(req.body);
      const admin = await registerAdmin(adminData);
      req.session.adminId = admin.id;
      res.json({ 
        message: "Admin registration successful", 
        admin: { 
          id: admin.id, 
          username: admin.username, 
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role
        } 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/admin/auth/login', async (req, res) => {
    try {
      const credentials = loginAdminSchema.parse(req.body);
      const admin = await loginAdmin(credentials);
      req.session.adminId = admin.id;
      res.json({ 
        message: "Admin login successful", 
        admin: { 
          id: admin.id, 
          username: admin.username, 
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role
        } 
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  app.post('/api/admin/auth/logout', (req, res) => {
    req.session.adminId = undefined;
    res.json({ message: "Admin logout successful" });
  });

  app.get('/api/admin/auth/user', isAdmin, async (req, res) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ message: "Admin not found" });
      }
      res.json({
        id: req.admin.id,
        username: req.admin.username,
        email: req.admin.email,
        firstName: req.admin.firstName,
        lastName: req.admin.lastName,
        role: req.admin.role,
        isActive: req.admin.isActive
      });
    } catch (error) {
      console.error("Error fetching admin user:", error);
      res.status(500).json({ message: "Failed to fetch admin user" });
    }
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
  app.get('/api/admin/users', isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users/:targetUserId/credit', isAdmin, async (req: any, res) => {
    try {
      const adminId = req.admin.id;
      const { targetUserId } = req.params;
      const { cryptoId, amount } = req.body;
      
      const schema = z.object({
        cryptoId: z.number(),
        amount: z.string(),
      });
      
      const validated = schema.parse({ cryptoId, amount });
      
      await storage.creditUserBalance(parseInt(targetUserId), validated.cryptoId, validated.amount, adminId);
      
      res.json({ message: "User balance credited successfully" });
    } catch (error) {
      console.error("Error crediting user balance:", error);
      res.status(500).json({ message: "Failed to credit user balance" });
    }
  });

  app.post('/api/admin/users/:targetUserId/debit', isAdmin, async (req: any, res) => {
    try {
      const adminId = req.admin.id;
      const { targetUserId } = req.params;
      const { cryptoId, amount } = req.body;
      
      const schema = z.object({
        cryptoId: z.number(),
        amount: z.string(),
      });
      
      const validated = schema.parse({ cryptoId, amount });
      
      await storage.debitUserBalance(parseInt(targetUserId), validated.cryptoId, validated.amount, adminId);
      
      res.json({ message: "User balance debited successfully" });
    } catch (error) {
      console.error("Error debiting user balance:", error);
      res.status(500).json({ message: "Failed to debit user balance" });
    }
  });

  app.get('/api/admin/transactions', isAdmin, async (req: any, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching admin transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Test user creation route
  app.post('/api/admin/create-test-user', async (req, res) => {
    try {
      const { hashPassword } = await import("./auth");
      
      const testUserData = {
        username: "hanlietheron",
        email: "Hanlietheron13@gmail.com",
        password: "test123456",
        firstName: "Hanlie Dorothea",
        lastName: "Theron",
        country: "South Africa",
        city: "Johannesburg",
      };
      
      const passwordHash = await hashPassword(testUserData.password);
      
      const user = await storage.createTestUser({
        ...testUserData,
        passwordHash,
      });
      
      // Credit user account with $60,000 equivalent in BTC
      const cryptos = await storage.getCryptocurrencies();
      const btc = cryptos.find(c => c.symbol === "BTC");
      if (btc) {
        const marketData = await storage.getMarketData();
        const btcMarketData = marketData.find(m => m.cryptoId === btc.id);
        if (btcMarketData) {
          const btcPriceUsd = parseFloat(btcMarketData.priceUsd);
          const btcAmount = (60000 / btcPriceUsd).toFixed(8);
          await storage.creditUserBalance(user.id, btc.id, btcAmount, 1);
        }
      }
      
      res.json({ 
        message: "Test user created successfully with comprehensive transaction history",
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          country: user.country,
          city: user.city,
        } 
      });
    } catch (error: any) {
      console.error("Error creating test user:", error);
      res.status(500).json({ message: error.message });
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

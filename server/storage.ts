import {
  users,
  adminUsers,
  cryptocurrencies,
  wallets,
  transactions,
  zarBalances,
  marketData,
  type User,
  type InsertUser,
  type RegisterUser,
  type AdminUser,
  type InsertAdminUser,
  type RegisterAdmin,
  type Cryptocurrency,
  type InsertCryptocurrency,
  type Wallet,
  type InsertWallet,
  type Transaction,
  type InsertTransaction,
  type ZarBalance,
  type InsertZarBalance,
  type MarketData,
  type InsertMarketData,
  type WalletWithCrypto,
  type TransactionWithCrypto,
  type UserWithProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";
import { randomBytes } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations (local auth)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: RegisterUser & { passwordHash: string }): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

  // Auto-wallet creation
  createWalletsForAllCryptocurrencies(userId: number): Promise<void>;
  generateWalletAddress(cryptoSymbol: string): string;

  // Admin user operations
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(admin: RegisterAdmin & { passwordHash: string }): Promise<AdminUser>;
  updateAdminUser(id: number, updates: Partial<AdminUser>): Promise<AdminUser>;

  // Cryptocurrency operations
  getCryptocurrencies(): Promise<Cryptocurrency[]>;
  createCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency>;

  // Wallet operations
  getUserWallets(userId: number): Promise<WalletWithCrypto[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(walletId: number, balance: string): Promise<void>;
  getWalletByUserAndCrypto(userId: number, cryptoId: number): Promise<Wallet | undefined>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<TransactionWithCrypto[]>;
  getAllTransactions(): Promise<TransactionWithCrypto[]>;

  // ZAR balance operations
  getUserZarBalance(userId: number): Promise<ZarBalance>;
  updateZarBalance(userId: number, balance: string): Promise<void>;

  // Market data operations
  getMarketData(): Promise<MarketData[]>;
  updateMarketData(cryptoId: number, data: Partial<InsertMarketData>): Promise<void>;

  // Admin operations
  getAllUsers(): Promise<UserWithProfile[]>;
  creditUserBalance(userId: number, cryptoId: number, amount: string, adminUserId: number): Promise<void>;
  debitUserBalance(userId: number, cryptoId: number, amount: string, adminUserId: number): Promise<void>;

  // Test user creation with transactions
  createTestUser(userData: RegisterUser & { passwordHash: string }): Promise<User>;
  generateRandomTransactionHistory(userId: number): Promise<void>;

  // Initialization
  initializeDefaultData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: RegisterUser & { passwordHash: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: userData.username,
        email: userData.email,
        passwordHash: userData.passwordHash,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        country: userData.country || "South Africa",
        city: userData.city || null,
      })
      .returning();

    // Create initial ZAR balance
    await db.insert(zarBalances).values({
      userId: user.id,
      balance: "0",
      updatedAt: new Date(),
    });

    // Auto-create wallets for all cryptocurrencies
    await this.createWalletsForAllCryptocurrencies(user.id);

    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Admin user operations
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin;
  }

  async createAdminUser(adminData: RegisterAdmin & { passwordHash: string }): Promise<AdminUser> {
    const [admin] = await db
      .insert(adminUsers)
      .values({
        username: adminData.username,
        email: adminData.email,
        passwordHash: adminData.passwordHash,
        firstName: adminData.firstName || null,
        lastName: adminData.lastName || null,
        role: adminData.role || "admin",
      })
      .returning();
    return admin;
  }

  async updateAdminUser(id: number, updates: Partial<AdminUser>): Promise<AdminUser> {
    const [admin] = await db
      .update(adminUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adminUsers.id, id))
      .returning();
    return admin;
  }

  // Cryptocurrency operations
  async getCryptocurrencies(): Promise<Cryptocurrency[]> {
    return await db.select().from(cryptocurrencies).where(eq(cryptocurrencies.isActive, true));
  }

  async createCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency> {
    const [cryptocurrency] = await db
      .insert(cryptocurrencies)
      .values(crypto)
      .returning();
    return cryptocurrency;
  }

  // Wallet operations
  async getUserWallets(userId: number): Promise<WalletWithCrypto[]> {
    return await db
      .select()
      .from(wallets)
      .innerJoin(cryptocurrencies, eq(wallets.cryptoId, cryptocurrencies.id))
      .where(eq(wallets.userId, userId))
      .then(rows => rows.map(row => ({
        ...row.wallets,
        cryptocurrency: row.cryptocurrencies,
      })));
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [newWallet] = await db
      .insert(wallets)
      .values(wallet)
      .returning();
    return newWallet;
  }

  async updateWalletBalance(walletId: number, balance: string): Promise<void> {
    await db
      .update(wallets)
      .set({ balance, updatedAt: new Date() })
      .where(eq(wallets.id, walletId));
  }

  async getWalletByUserAndCrypto(userId: number, cryptoId: number): Promise<Wallet | undefined> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, userId), eq(wallets.cryptoId, cryptoId)));
    return wallet;
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(userId: number): Promise<TransactionWithCrypto[]> {
    return await db
      .select()
      .from(transactions)
      .innerJoin(cryptocurrencies, eq(transactions.cryptoId, cryptocurrencies.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .then(rows => rows.map(row => ({
        ...row.transactions,
        cryptocurrency: row.cryptocurrencies,
      })));
  }

  async getAllTransactions(): Promise<TransactionWithCrypto[]> {
    return await db
      .select()
      .from(transactions)
      .innerJoin(cryptocurrencies, eq(transactions.cryptoId, cryptocurrencies.id))
      .orderBy(desc(transactions.createdAt))
      .then(rows => rows.map(row => ({
        ...row.transactions,
        cryptocurrency: row.cryptocurrencies,
      })));
  }

  // ZAR balance operations
  async getUserZarBalance(userId: number): Promise<ZarBalance> {
    const [balance] = await db
      .select()
      .from(zarBalances)
      .where(eq(zarBalances.userId, userId));

    if (!balance) {
      const [newBalance] = await db
        .insert(zarBalances)
        .values({ userId, balance: "0" })
        .returning();
      return newBalance;
    }

    return balance;
  }

  async updateZarBalance(userId: number, balance: string): Promise<void> {
    await db
      .insert(zarBalances)
      .values({ userId, balance })
      .onConflictDoUpdate({
        target: zarBalances.userId,
        set: { balance, updatedAt: new Date() },
      });
  }

  // Market data operations
  async getMarketData(): Promise<MarketData[]> {
    return await db
      .select()
      .from(marketData)
      .innerJoin(cryptocurrencies, eq(marketData.cryptoId, cryptocurrencies.id))
      .orderBy(desc(marketData.updatedAt))
      .then(rows => rows.map(row => row.market_data));
  }

  async updateMarketData(cryptoId: number, data: Partial<InsertMarketData>): Promise<void> {
    await db
      .insert(marketData)
      .values({ cryptoId, ...data } as InsertMarketData)
      .onConflictDoUpdate({
        target: marketData.cryptoId,
        set: { ...data, updatedAt: new Date() },
      });
  }

  // Admin operations
  async getAllUsers(): Promise<UserWithProfile[]> {
    const allUsers = await db.select().from(users);
    const result: UserWithProfile[] = [];

    for (const user of allUsers) {
      const userWallets = await this.getUserWallets(user.id);
      const userZarBalance = await this.getUserZarBalance(user.id);
      const userTransactions = await this.getUserTransactions(user.id);

      result.push({
        ...user,
        wallets: userWallets,
        zarBalance: userZarBalance,
        transactions: userTransactions,
      });
    }

    return result;
  }

  async creditUserBalance(userId: number, cryptoId: number, amount: string, adminUserId: number): Promise<void> {
    const wallet = await this.getWalletByUserAndCrypto(userId, cryptoId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const newBalance = (parseFloat(wallet.balance || "0") + parseFloat(amount)).toString();
    await this.updateWalletBalance(wallet.id, newBalance);

    await this.createTransaction({
      userId,
      cryptoId,
      type: "admin_credit",
      amount,
      adminUserId,
      description: `Admin credit by ${adminUserId}`,
    });
  }

  async debitUserBalance(userId: number, cryptoId: number, amount: string, adminUserId: number): Promise<void> {
    const wallet = await this.getWalletByUserAndCrypto(userId, cryptoId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const newBalance = Math.max(0, parseFloat(wallet.balance || "0") - parseFloat(amount)).toString();
    await this.updateWalletBalance(wallet.id, newBalance);

    await this.createTransaction({
      userId,
      cryptoId,
      type: "admin_debit",
      amount,
      adminUserId,
      description: `Admin debit by ${adminUserId}`,
    });
  }

  // Generate a random wallet address
  generateWalletAddress(cryptoSymbol: string): string {
    const prefixes: Record<string, string> = {
      BTC: "1",
      ETH: "0x",
      XRP: "r",
      SOL: "",
      USDT: "0x",
      USDC: "0x",
      ADA: "addr1",
      DOT: "1",
      LINK: "0x",
      LTC: "L",
      BCH: "1",
      MATIC: "0x",
      AVAX: "0x",
      ATOM: "cosmos1",
      UNI: "0x",
      ALGO: "",
    };

    const prefix = prefixes[cryptoSymbol] || "";
    const randomPart = randomBytes(20).toString("hex");

    if (cryptoSymbol === "BTC" || cryptoSymbol === "BCH" || cryptoSymbol === "DOT") {
      return prefix + randomPart.substring(0, 33);
    } else if (cryptoSymbol === "ETH" || cryptoSymbol === "USDT" || cryptoSymbol === "USDC" || cryptoSymbol === "LINK" || cryptoSymbol === "MATIC" || cryptoSymbol === "AVAX" || cryptoSymbol === "UNI") {
      return prefix + randomPart;
    } else if (cryptoSymbol === "XRP") {
      return prefix + randomPart.substring(0, 33);
    } else if (cryptoSymbol === "ADA") {
      return prefix + randomPart.substring(0, 55);
    } else if (cryptoSymbol === "LTC") {
      return prefix + randomPart.substring(0, 33);
    } else if (cryptoSymbol === "ATOM") {
      return prefix + randomPart.substring(0, 39);
    } else if (cryptoSymbol === "SOL" || cryptoSymbol === "ALGO") {
      return randomPart.substring(0, 44);
    }

    return randomPart.substring(0, 44);
  }

  // Auto-create wallets for all cryptocurrencies
  async createWalletsForAllCryptocurrencies(userId: number): Promise<void> {
    const cryptos = await this.getCryptocurrencies();

    for (const crypto of cryptos) {
      const existingWallet = await this.getWalletByUserAndCrypto(userId, crypto.id);
      if (!existingWallet) {
        await this.createWallet({
          userId,
          cryptoId: crypto.id,
          address: this.generateWalletAddress(crypto.symbol),
          balance: "0",
        });
      }
    }
  }

  // Create test user with comprehensive data
  async createTestUser(userData: RegisterUser & { passwordHash: string }): Promise<User> {
    const user = await this.createUser(userData);

    // Generate random transaction history after user creation
    await this.generateRandomTransactionHistory(user.id);

    return user;
  }

  // Clear all transactions for a user
  async clearUserTransactions(userId: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.userId, userId));
  }

  // Reset all wallet balances for a user to zero
  async resetUserWalletBalances(userId: number): Promise<void> {
    await db.update(wallets)
      .set({ balance: "0" })
      .where(eq(wallets.userId, userId));
  }

  // Generate comprehensive transaction history from 2024 to present
  async generateRandomTransactionHistory(userId: number): Promise<void> {
    const cryptos = await this.getCryptocurrencies();
    const paymentMethods = ["credit_card", "debit_card", "bank_transfer", "wire_transfer", "ach"];

    // Generate transactions from January 2024 to present
    const startDate = new Date('2024-01-01');
    const endDate = new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let runningBalances: Record<number, number> = {};
    cryptos.forEach(crypto => {
      runningBalances[crypto.id] = 0;
    });

    // Create 50-80 transactions spread across 2024 to present
    const totalTransactions = 60 + Math.floor(Math.random() * 20);
    
    for (let i = 0; i < totalTransactions; i++) {
      // Random date between start and end
      const randomDayOffset = Math.floor(Math.random() * totalDays);
      const transactionDate = new Date(startDate.getTime() + (randomDayOffset * 24 * 60 * 60 * 1000));
      
      const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
      
      // Determine transaction type based on current balance and probability
      let type: string;
      const currentBalance = runningBalances[crypto.id] || 0;
      const rand = Math.random();
      
      if (currentBalance < 0.001) {
        // Force credit if balance is too low
        type = Math.random() > 0.4 ? "admin_credit" : "deposit";
      } else if (rand < 0.4) {
        // 40% chance of credit operations
        type = Math.random() > 0.5 ? "admin_credit" : "deposit";
      } else if (rand < 0.7) {
        // 30% chance of debit operations (only if sufficient balance)
        type = Math.random() > 0.5 ? "admin_debit" : "withdrawal";
      } else {
        // 30% chance of trading operations
        type = Math.random() > 0.5 ? "buy" : "sell";
      }

      let amount: number;
      if (type === "admin_credit" || type === "deposit") {
        // Credit operations: $500 to $15,000 worth
        const usdValue = 500 + Math.random() * 14500;
        const priceUsd = this.getHistoricalPrice(crypto.symbol, transactionDate);
        amount = usdValue / priceUsd;
      } else if (type === "admin_debit" || type === "withdrawal") {
        // Debit operations: 5% to 40% of current balance
        if (currentBalance > 0) {
          const maxDebit = currentBalance * 0.4;
          const minDebit = Math.min(currentBalance * 0.05, maxDebit);
          amount = minDebit + Math.random() * (maxDebit - minDebit);
        } else {
          continue; // Skip if no balance
        }
      } else {
        // Trading operations
        if (currentBalance > 0) {
          amount = Math.random() * currentBalance * 0.3;
        } else {
          continue;
        }
      }

      const priceUsd = this.getHistoricalPrice(crypto.symbol, transactionDate);
      const priceZar = priceUsd * 18.5; // Approximate ZAR exchange rate

      const totalUsd = (amount * priceUsd).toFixed(2);
      const totalZar = (amount * priceZar).toFixed(2);

      // Update running balance
      if (type === "admin_credit" || type === "deposit" || type === "buy") {
        runningBalances[crypto.id] = (runningBalances[crypto.id] || 0) + amount;
      } else {
        runningBalances[crypto.id] = Math.max(0, (runningBalances[crypto.id] || 0) - amount);
      }

      const paymentMethod = ["admin_credit", "admin_debit"].includes(type) ? null : paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      // Create transaction with historical date
      const transaction = await db.insert(transactions).values({
        userId,
        cryptoId: crypto.id,
        type,
        amount: amount.toFixed(8),
        price: priceUsd.toString(),
        totalUsd,
        totalZar,
        status: "completed",
        paymentMethod,
        description: this.getTransactionDescription(type, paymentMethod),
        adminUserId: ["admin_credit", "admin_debit"].includes(type) ? 1 : null,
        walletAddress: type === "withdrawal" ? this.generateRandomAddress(crypto.symbol) : null,
        transactionHash: ["withdrawal", "buy", "sell"].includes(type) ? this.generateRandomHash() : null,
        createdAt: transactionDate,
        updatedAt: transactionDate,
      }).returning();

      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
    }

    // Update final wallet balances
    for (const crypto of cryptos) {
      const wallet = await this.getWalletByUserAndCrypto(userId, crypto.id);
      if (wallet && runningBalances[crypto.id] > 0) {
        await this.updateWalletBalance(wallet.id, runningBalances[crypto.id].toFixed(8));
      }
    }
  }

  // Get historical crypto prices (simplified simulation)
  private getHistoricalPrice(symbol: string, date: Date): number {
    const currentPrices: Record<string, number> = {
      'BTC': 108748.97,
      'ETH': 3341.23,
      'XRP': 2.23,
      'ADA': 0.89,
      'SOL': 176.45,
      'DOT': 7.12
    };

    const basePrice = currentPrices[symbol] || 100;
    const daysSince2024 = Math.ceil((date.getTime() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24));
    const volatility = 0.02 + Math.random() * 0.05; // 2-7% daily volatility
    const trend = Math.sin(daysSince2024 / 30) * 0.3; // Monthly trend cycle
    
    return basePrice * (0.3 + 0.7 * (1 + trend + (Math.random() - 0.5) * volatility));
  }

  private getTransactionDescription(type: string, paymentMethod: string | null): string {
    switch (type) {
      case "admin_credit":
        return "Admin credit - Account funding";
      case "admin_debit":
        return "Admin debit - Balance adjustment";
      case "deposit":
        return `Deposit via ${paymentMethod?.replace('_', ' ').toUpperCase()}`;
      case "withdrawal":
        return `Withdrawal to external wallet`;
      case "buy":
        return "Buy order executed";
      case "sell":
        return "Sell order executed";
      default:
        return `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`;
    }
  }

  private generateRandomAddress(symbol: string): string {
    const prefixes: Record<string, string> = {
      'BTC': ['1', '3', 'bc1'],
      'ETH': ['0x'],
      'XRP': ['r'],
      'ADA': ['addr1'],
      'SOL': [''],
      'DOT': ['1']
    };
    
    const prefix = prefixes[symbol] ? prefixes[symbol][Math.floor(Math.random() * prefixes[symbol].length)] : '';
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = prefix;
    const length = symbol === 'ETH' ? 42 : 34;
    
    for (let i = prefix.length; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateRandomHash(): string {
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;

        // Get market data for pricing
        const cryptoMarketData = await db.select().from(marketData).where(eq(marketData.cryptoId, crypto.id));
        const priceUsd = cryptoMarketData.length > 0 ? parseFloat(cryptoMarketData[0].priceUsd) : 100;
        const priceZar = cryptoMarketData.length > 0 ? parseFloat(cryptoMarketData[0].priceZar) : 1700;

        const totalUsd = (parseFloat(amount) * priceUsd).toFixed(2);
        const totalZar = (parseFloat(amount) * priceZar).toFixed(2);

        await this.createTransaction({
          userId,
          cryptoId: crypto.id,
          type: "withdrawal",
          amount,
          price: priceUsd.toString(),
          totalUsd,
          totalZar,
          paymentMethod: "wallet_address",
          walletAddress: this.generateWalletAddress(crypto.symbol),
          transactionHash: randomBytes(32).toString("hex"),
          description: "Withdrawal to external wallet",
        });

        // Update wallet balance
        const newBalance = (parseFloat(wallet.balance || "0") - parseFloat(amount)).toFixed(8);
        await this.updateWalletBalance(wallet.id, newBalance);
      }
    }
  }

  // Helper method to create default cryptocurrencies
  async createDefaultCryptocurrencies(): Promise<void> {
    const defaultCryptos = [
      { symbol: "BTC", name: "Bitcoin", iconUrl: "/crypto-icons/btc.svg" },
      { symbol: "ETH", name: "Ethereum", iconUrl: "/crypto-icons/eth.svg" },
      { symbol: "XRP", name: "Ripple", iconUrl: "/crypto-icons/xrp.svg" },
      { symbol: "SOL", name: "Solana", iconUrl: "/crypto-icons/sol.svg" },
      { symbol: "USDT", name: "Tether", iconUrl: "/crypto-icons/usdt.svg" },
      { symbol: "USDC", name: "USD Coin", iconUrl: "/crypto-icons/usdc.svg" },
    ];

    for (const crypto of defaultCryptos) {
      await this.createCryptocurrency(crypto);
    }
  }

  // Helper method to create default market data
  async createDefaultMarketData(): Promise<void> {
    const cryptos = await this.getCryptocurrencies();
    const defaultPrices = {
      BTC: { priceUsd: "95000.00", priceZar: "1710000.00", change24h: "2.5" },
      ETH: { priceUsd: "3500.00", priceZar: "63000.00", change24h: "1.8" },
      XRP: { priceUsd: "2.50", priceZar: "45.00", change24h: "-0.5" },
      SOL: { priceUsd: "220.00", priceZar: "3960.00", change24h: "3.2" },
      USDT: { priceUsd: "1.00", priceZar: "18.00", change24h: "0.0" },
      USDC: { priceUsd: "1.00", priceZar: "18.00", change24h: "0.0" },
    };

    for (const crypto of cryptos) {
      const priceData = defaultPrices[crypto.symbol as keyof typeof defaultPrices];
      if (priceData) {
        await this.updateMarketData(crypto.id, {
          priceUsd: priceData.priceUsd,
          priceZar: priceData.priceZar,
          change24h: priceData.change24h,
          volume24h: "1000000.00",
          marketCap: "50000000000.00",
          lastUpdated: new Date(),
        });
      }
    }
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    try {
      // Initialize cryptocurrencies
      const existingCryptos = await this.getCryptocurrencies();
      if (existingCryptos.length === 0) {
        console.log("🔄 Initializing default cryptocurrencies...");
        await this.createDefaultCryptocurrencies();
      }

      // Initialize market data
      const existingMarketData = await this.getMarketData();
      if (existingMarketData.length === 0) {
        console.log("🔄 Initializing default market data...");
        await this.createDefaultMarketData();
      }

      // Check if default admin exists
      const defaultAdmin = await this.getAdminUserByUsername("admin");
      if (!defaultAdmin) {
        console.log("🔄 Creating default admin user...");
        const { hashPassword } = await import("./auth");

        const adminData = {
          username: "admin",
          email: "admin@admin.com",
          password: "admin123",
          firstName: "System",
          lastName: "Administrator",
          role: "super_admin" as const,
        };

        const passwordHash = await hashPassword(adminData.password);

        await this.createAdminUser({
          ...adminData,
          passwordHash,
        });

        console.log("✅ Default admin user created successfully");
      } else {
        console.log("✅ Default admin user already exists");
      }

      // Check if test user exists
      const testUser = await this.getUserByEmail("Hanlietheron13@gmail.com");
      if (!testUser) {
        console.log("🔄 Creating test user...");
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

        const user = await this.createTestUser({
          ...testUserData,
          passwordHash,
        });

        // Credit user account with $60,000 equivalent in BTC
        const cryptos = await this.getCryptocurrencies();
        const btc = cryptos.find(c => c.symbol === "BTC");
        if (btc) {
          const marketData = await this.getMarketData();
          const btcMarketData = marketData.find(m => m.cryptoId === btc.id);
          if (btcMarketData) {
            const btcPriceUsd = parseFloat(btcMarketData.priceUsd);
            const btcAmount = (60000 / btcPriceUsd).toFixed(8);
            await this.creditUserBalance(user.id, btc.id, btcAmount, 1);
          }
        }

        console.log("✅ Test user 'HANLIE DOROTHEA THERON' created successfully");
      } else {
        console.log("✅ Test user 'HANLIE DOROTHEA THERON' already exists");
      }

      console.log("✅ Database initialization complete");
    } catch (error) {
      console.error("❌ Error during database initialization:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
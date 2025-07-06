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
    
    const newBalance = (parseFloat(wallet.balance) + parseFloat(amount)).toString();
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
    
    const newBalance = Math.max(0, parseFloat(wallet.balance) - parseFloat(amount)).toString();
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
  private generateWalletAddress(cryptoSymbol: string): string {
    const prefixes: Record<string, string> = {
      BTC: "1",
      ETH: "0x",
      XRP: "r",
      SOL: "",
      USDT: "0x",
      USDC: "0x",
    };
    
    const prefix = prefixes[cryptoSymbol] || "";
    const randomPart = randomBytes(20).toString("hex");
    
    if (cryptoSymbol === "BTC") {
      return prefix + randomPart.substring(0, 33);
    } else if (cryptoSymbol === "ETH" || cryptoSymbol === "USDT" || cryptoSymbol === "USDC") {
      return prefix + randomPart;
    } else if (cryptoSymbol === "XRP") {
      return prefix + randomPart.substring(0, 33);
    }
    
    return randomPart.substring(0, 44);
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    // Create default cryptocurrencies
    const defaultCryptos = [
      { symbol: "BTC", name: "Bitcoin", logoUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
      { symbol: "ETH", name: "Ethereum", logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
      { symbol: "XRP", name: "XRP", logoUrl: "https://cryptologos.cc/logos/xrp-xrp-logo.png" },
      { symbol: "SOL", name: "Solana", logoUrl: "https://cryptologos.cc/logos/solana-sol-logo.png" },
      { symbol: "USDT", name: "Tether", logoUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
      { symbol: "USDC", name: "USD Coin", logoUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
    ];

    for (const crypto of defaultCryptos) {
      const existing = await db.select().from(cryptocurrencies).where(eq(cryptocurrencies.symbol, crypto.symbol));
      if (existing.length === 0) {
        await this.createCryptocurrency(crypto);
      }
    }

    // Users will be created through registration - no default users needed

    // Initialize market data with ZAR prices
    const marketDataDefaults = [
      { cryptoId: 1, priceZar: "1847892.45", priceUsd: "108748.97", percentChange24h: "2.56" },
      { cryptoId: 2, priceZar: "43295.68", priceUsd: "2546.86", percentChange24h: "1.62" },
      { cryptoId: 3, priceZar: "38.56", priceUsd: "2.27", percentChange24h: "2.70" },
      { cryptoId: 4, priceZar: "2574.85", priceUsd: "151.57", percentChange24h: "3.03" },
      { cryptoId: 5, priceZar: "17.00", priceUsd: "1.00", percentChange24h: "0.00" },
      { cryptoId: 6, priceZar: "17.00", priceUsd: "1.00", percentChange24h: "0.00" },
    ];

    for (const data of marketDataDefaults) {
      await this.updateMarketData(data.cryptoId, data);
    }
  }
}

export const storage = new DatabaseStorage();

import {
  users,
  cryptocurrencies,
  wallets,
  transactions,
  zarBalances,
  marketData,
  type User,
  type UpsertUser,
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
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Cryptocurrency operations
  getCryptocurrencies(): Promise<Cryptocurrency[]>;
  createCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency>;
  
  // Wallet operations
  getUserWallets(userId: string): Promise<WalletWithCrypto[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(walletId: number, balance: string): Promise<void>;
  getWalletByUserAndCrypto(userId: string, cryptoId: number): Promise<Wallet | undefined>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<TransactionWithCrypto[]>;
  getAllTransactions(): Promise<TransactionWithCrypto[]>;
  
  // ZAR balance operations
  getUserZarBalance(userId: string): Promise<ZarBalance>;
  updateZarBalance(userId: string, balance: string): Promise<void>;
  
  // Market data operations
  getMarketData(): Promise<MarketData[]>;
  updateMarketData(cryptoId: number, data: Partial<InsertMarketData>): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<UserWithProfile[]>;
  creditUserBalance(userId: string, cryptoId: number, amount: string, adminUserId: string): Promise<void>;
  debitUserBalance(userId: string, cryptoId: number, amount: string, adminUserId: string): Promise<void>;
  
  // Initialization
  initializeDefaultData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
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
  async getUserWallets(userId: string): Promise<WalletWithCrypto[]> {
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

  async getWalletByUserAndCrypto(userId: string, cryptoId: number): Promise<Wallet | undefined> {
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

  async getUserTransactions(userId: string): Promise<TransactionWithCrypto[]> {
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
  async getUserZarBalance(userId: string): Promise<ZarBalance> {
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

  async updateZarBalance(userId: string, balance: string): Promise<void> {
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

  async creditUserBalance(userId: string, cryptoId: number, amount: string, adminUserId: string): Promise<void> {
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

  async debitUserBalance(userId: string, cryptoId: number, amount: string, adminUserId: string): Promise<void> {
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

    // Create default user: HANLIE DOROTHEA THERON
    const defaultUser = {
      id: "hanlie_theron_001",
      email: "HANLIETHERON13@GMAIL.COM",
      firstName: "HANLIE DOROTHEA",
      lastName: "THERON",
      country: "South Africa",
      city: "Johannesburg",
      isAdmin: false,
    };

    const existingUser = await this.getUser(defaultUser.id);
    if (!existingUser) {
      await this.upsertUser(defaultUser);

      // Create wallets for the default user
      const cryptos = await this.getCryptocurrencies();
      for (const crypto of cryptos) {
        await this.createWallet({
          userId: defaultUser.id,
          cryptoId: crypto.id,
          address: this.generateWalletAddress(crypto.symbol),
          balance: "0",
        });
      }

      // Initialize ZAR balance
      await this.updateZarBalance(defaultUser.id, "127450.89");
    }

    // Create admin user
    const adminUser = {
      id: "admin_001",
      email: "admin@quotexcoin.za",
      firstName: "Admin",
      lastName: "User",
      country: "South Africa",
      city: "Cape Town",
      isAdmin: true,
    };

    const existingAdmin = await this.getUser(adminUser.id);
    if (!existingAdmin) {
      await this.upsertUser(adminUser);
    }

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

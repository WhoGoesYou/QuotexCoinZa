import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - for regular users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  country: varchar("country").default("South Africa"),
  city: varchar("city"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin users table - separate from regular users
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role", { length: 20 }).default("admin"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cryptocurrency definitions
export const cryptocurrencies = pgTable("cryptocurrencies", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  logoUrl: varchar("logo_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User wallets for different cryptocurrencies
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cryptoId: integer("crypto_id").notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transaction history
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cryptoId: integer("crypto_id").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'buy', 'sell', 'deposit', 'withdrawal', 'admin_credit', 'admin_debit'
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  price: decimal("price", { precision: 20, scale: 8 }),
  totalZar: decimal("total_zar", { precision: 20, scale: 2 }),
  totalUsd: decimal("total_usd", { precision: 20, scale: 8 }),
  status: varchar("status", { length: 20 }).default("completed"), // 'pending', 'completed', 'failed'
  adminUserId: integer("admin_user_id"), // For admin actions
  description: text("description"),
  paymentMethod: varchar("payment_method", { length: 50 }), // 'credit_card', 'debit_card', 'bank_transfer', 'wire_transfer', 'ach', 'wallet_address', 'mpesa', 'paystack', 'flutterwave'
  network: varchar("network", { length: 50 }), // 'bitcoin', 'ethereum', 'polygon', 'bsc', 'solana', etc.
  fiatCurrency: varchar("fiat_currency", { length: 3 }), // 'USD', 'ZAR', 'NGN', 'EUR', 'GBP'
  walletAddress: varchar("wallet_address", { length: 255 }), // For withdrawals
  transactionHash: varchar("transaction_hash", { length: 255 }), // Blockchain transaction hash
  createdAt: timestamp("created_at").defaultNow(),
});

// ZAR balances for users
export const zarBalances = pgTable("zar_balances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  balance: decimal("balance", { precision: 20, scale: 2 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fiat currency balances for users (multi-currency support)
export const fiatBalances = pgTable("fiat_balances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(), // USD, ZAR, NGN, EUR, GBP, etc.
  balance: decimal("balance", { precision: 20, scale: 2 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Market data for cryptocurrencies
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  cryptoId: integer("crypto_id").notNull().unique(),
  priceZar: decimal("price_zar", { precision: 20, scale: 2 }).notNull(),
  priceUsd: decimal("price_usd", { precision: 20, scale: 8 }).notNull(),
  priceNgn: decimal("price_ngn", { precision: 20, scale: 2 }).notNull().default("0"),
  percentChange24h: decimal("percent_change_24h", { precision: 10, scale: 2 }),
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }),
  marketCap: decimal("market_cap", { precision: 30, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  transactions: many(transactions),
  zarBalance: many(zarBalances),
  fiatBalances: many(fiatBalances),
}));

export const fiatBalancesRelations = relations(fiatBalances, ({ one }) => ({
  user: one(users, {
    fields: [fiatBalances.userId],
    references: [users.id],
  }),
}));

export const cryptocurrenciesRelations = relations(cryptocurrencies, ({ many }) => ({
  wallets: many(wallets),
  transactions: many(transactions),
  marketData: many(marketData),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  cryptocurrency: one(cryptocurrencies, {
    fields: [wallets.cryptoId],
    references: [cryptocurrencies.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  cryptocurrency: one(cryptocurrencies, {
    fields: [transactions.cryptoId],
    references: [cryptocurrencies.id],
  }),
}));

export const zarBalancesRelations = relations(zarBalances, ({ one }) => ({
  user: one(users, {
    fields: [zarBalances.userId],
    references: [users.id],
  }),
}));

export const marketDataRelations = relations(marketData, ({ one }) => ({
  cryptocurrency: one(cryptocurrencies, {
    fields: [marketData.cryptoId],
    references: [cryptocurrencies.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true });
export const insertCryptocurrencySchema = createInsertSchema(cryptocurrencies).omit({ id: true });
export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertZarBalanceSchema = createInsertSchema(zarBalances).omit({ id: true });
export const insertMarketDataSchema = createInsertSchema(marketData).omit({ id: true });

// Types
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;

// Registration and login schemas
export const registerUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

export const loginUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Admin registration and login schemas
export const registerAdminSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.string().default("admin"),
});

export const loginAdminSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterAdmin = z.infer<typeof registerAdminSchema>;
export type LoginAdmin = z.infer<typeof loginAdminSchema>;
export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;
export type InsertCryptocurrency = z.infer<typeof insertCryptocurrencySchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type ZarBalance = typeof zarBalances.$inferSelect;
export type InsertZarBalance = z.infer<typeof insertZarBalanceSchema>;
export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

// Wallet with cryptocurrency info
export type WalletWithCrypto = Wallet & {
  cryptocurrency: Cryptocurrency;
};

// Transaction with cryptocurrency info
export type TransactionWithCrypto = Transaction & {
  cryptocurrency: Cryptocurrency;
};

// User with complete profile
export type UserWithProfile = User & {
  wallets: WalletWithCrypto[];
  zarBalance: ZarBalance;
  transactions: TransactionWithCrypto[];
};

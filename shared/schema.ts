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

// User storage table
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
  isAdmin: boolean("is_admin").default(false),
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
  status: varchar("status", { length: 20 }).default("completed"), // 'pending', 'completed', 'failed'
  adminUserId: integer("admin_user_id"), // For admin actions
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ZAR balances for users
export const zarBalances = pgTable("zar_balances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  balance: decimal("balance", { precision: 20, scale: 2 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Market data for cryptocurrencies
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  cryptoId: integer("crypto_id").notNull().unique(),
  priceZar: decimal("price_zar", { precision: 20, scale: 2 }).notNull(),
  priceUsd: decimal("price_usd", { precision: 20, scale: 8 }).notNull(),
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
export const insertCryptocurrencySchema = createInsertSchema(cryptocurrencies).omit({ id: true });
export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertZarBalanceSchema = createInsertSchema(zarBalances).omit({ id: true });
export const insertMarketDataSchema = createInsertSchema(marketData).omit({ id: true });

// Types
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

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

export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
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

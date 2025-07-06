import bcrypt from 'bcryptjs';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';
import type { Express, RequestHandler } from 'express';
import type { RegisterUser, LoginUser } from '@shared/schema';

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'development-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  req.user = user;
  next();
};

// Admin middleware
export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  
  req.user = user;
  next();
};

// Helper functions
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(userData: RegisterUser) {
  // Check if user already exists
  const existingUser = await storage.getUserByUsername(userData.username);
  if (existingUser) {
    throw new Error("Username already exists");
  }
  
  const existingEmail = await storage.getUserByEmail(userData.email);
  if (existingEmail) {
    throw new Error("Email already exists");
  }
  
  // Hash password and create user
  const passwordHash = await hashPassword(userData.password);
  const user = await storage.createUser({
    ...userData,
    passwordHash,
  });
  
  // Create initial wallets and ZAR balance
  const cryptocurrencies = await storage.getCryptocurrencies();
  for (const crypto of cryptocurrencies) {
    await storage.createWallet({
      userId: user.id,
      cryptoId: crypto.id,
      address: generateWalletAddress(crypto.symbol),
      balance: "0",
    });
  }
  
  // Initialize ZAR balance
  await storage.updateZarBalance(user.id, "0");
  
  return user;
}

export async function loginUser(credentials: LoginUser) {
  const user = await storage.getUserByUsername(credentials.username);
  if (!user) {
    throw new Error("Invalid username or password");
  }
  
  const isValidPassword = await comparePassword(credentials.password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error("Invalid username or password");
  }
  
  if (!user.isActive) {
    throw new Error("Account has been deactivated");
  }
  
  return user;
}

// Generate wallet address (simplified for demo)
function generateWalletAddress(cryptoSymbol: string): string {
  const prefix = {
    'BTC': '1',
    'ETH': '0x',
    'XRP': 'r',
    'SOL': '',
    'USDT': '0x',
    'USDC': '0x'
  }[cryptoSymbol] || '';
  
  const randomPart = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
  
  return prefix + randomPart.toUpperCase();
}

// Express session type extension
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}
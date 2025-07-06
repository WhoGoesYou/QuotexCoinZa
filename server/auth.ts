import bcrypt from 'bcryptjs';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';
import type { Express, RequestHandler } from 'express';
import type { RegisterUser, LoginUser, RegisterAdmin, LoginAdmin } from '@shared/schema';

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

// Admin middleware - checks for admin user session
export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.session?.adminId) {
    return res.status(401).json({ message: "Unauthorized - Admin login required" });
  }
  
  const admin = await storage.getAdminUser(req.session.adminId);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized - Admin not found" });
  }
  
  req.admin = admin;
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

// Admin registration function
export async function registerAdmin(adminData: RegisterAdmin) {
  // Check if admin already exists
  const existingAdmin = await storage.getAdminUserByUsername(adminData.username);
  if (existingAdmin) {
    throw new Error("Admin username already exists");
  }
  
  const existingEmail = await storage.getAdminUserByEmail(adminData.email);
  if (existingEmail) {
    throw new Error("Admin email already exists");
  }
  
  // Hash password
  const passwordHash = await hashPassword(adminData.password);
  
  // Create admin user
  const admin = await storage.createAdminUser({
    ...adminData,
    passwordHash,
  });
  
  return admin;
}

// Admin login function
export async function loginAdmin(credentials: LoginAdmin) {
  const admin = await storage.getAdminUserByUsername(credentials.username);
  if (!admin) {
    throw new Error("Invalid admin username or password");
  }
  
  const isValidPassword = await comparePassword(credentials.password, admin.passwordHash);
  if (!isValidPassword) {
    throw new Error("Invalid admin username or password");
  }
  
  if (!admin.isActive) {
    throw new Error("Admin account has been deactivated");
  }
  
  return admin;
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
      admin?: any;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    adminId?: number;
  }
}
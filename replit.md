# QUOTEX COIN WALLETS - Cryptocurrency Trading Platform

## Overview

QUOTEX COIN WALLETS is a professional cryptocurrency trading platform built with modern web technologies, targeting South African users and international markets. It provides users with the ability to buy, sell, and manage cryptocurrency wallets with real-time market data integration. The platform features a comprehensive admin panel for user management and transaction oversight. Prices are displayed primarily in USD with ZAR conversion for South African users.

## System Architecture

The application follows a full-stack monorepo architecture:

- **Frontend**: React with TypeScript, using Vite for build tooling
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth integration
- **Real-time Communication**: WebSocket implementation
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state management

## Key Components

### Database Schema
- **Users**: Stores user profiles with Replit OAuth integration
- **Cryptocurrencies**: Defines available cryptocurrencies (BTC, ETH, XRP, SOL, USDT, USDC)
- **Wallets**: User cryptocurrency holdings
- **Transactions**: Buy/sell transaction records
- **ZAR Balances**: South African Rand balances for users
- **Market Data**: Real-time cryptocurrency price information
- **Sessions**: Session storage for authentication

### Frontend Architecture
- **Component Structure**: Modular UI components using shadcn/ui
- **Pages**: Landing, Dashboard, Trading, Admin, and 404 pages
- **Hooks**: Custom hooks for authentication and mobile detection
- **Services**: WebSocket service for real-time updates and crypto API service
- **Routing**: File-based routing with Wouter

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **Authentication**: Replit OAuth with session management
- **Database Layer**: Drizzle ORM with PostgreSQL connection pooling
- **WebSocket Server**: Real-time communication for market updates
- **Storage Layer**: Abstracted data access layer with comprehensive CRUD operations

## Data Flow

1. **User Authentication**: Users authenticate via Replit OAuth
2. **Market Data**: Real-time cryptocurrency prices fetched from external APIs
3. **Trading**: Users execute buy/sell transactions with automatic wallet updates
4. **Admin Operations**: Administrators can manage users and view system analytics
5. **Real-time Updates**: WebSocket connections provide live market data and transaction updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Headless UI components
- **express**: Web framework for Node.js
- **ws**: WebSocket implementation

### Authentication & Security
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect client for Replit OAuth
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant management
- **lucide-react**: Icon library

## Deployment Strategy

The application is designed for deployment on Replit with the following configuration:

- **Development**: `npm run dev` - Runs both frontend and backend in development mode
- **Build**: `npm run build` - Creates production build using Vite and esbuild
- **Production**: `npm run start` - Serves the production build
- **Database**: Uses environment variable `DATABASE_URL` for PostgreSQL connection

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption
- `REPLIT_DOMAINS`: Allowed domains for OAuth
- `ISSUER_URL`: OAuth issuer URL (defaults to Replit)
- `REPL_ID`: Replit application ID

## Changelog

```
Changelog:
- July 06, 2025. Initial setup
- July 06, 2025. Enhanced branding and design:
  * Updated platform name from "QUOTEX COIN za" to "QUOTEX COIN WALLETS"
  * Added gradient styling to brand name throughout application
  * Removed ZA badges from navigation and hero section
  * Updated tagline to "Serving South Africa & Beyond"
  * Changed hero message to "Your gateway to digital wealth"
  * Enhanced cryptocurrency price display with USD primary pricing
  * Added professional Bitcoin-focused design with color-coded crypto icons
  * Improved crypto cards with enhanced visual hierarchy and ZAR conversion display
  * Fixed database constraints and application stability issues
- July 07, 2025. Completed migration from Replit Agent to Replit:
  * Successfully migrated project with PostgreSQL database setup
  * Created stunning landing page with professional cryptocurrency trading design
  * Implemented separate login/register pages with proper routing structure
  * Enhanced UI components with missing shadcn/ui components (Badge, Skeleton, Avatar, Sheet, Dialog)
  * Fixed authentication flow and routing logic
  * Admin login properly accessible via /admin/login route
  * Added floating help widget with 24/7 support features and FAQ system
  * Integrated professional contact support: support.quotex@quotexes.online, +1 (672) 380-5729
  * Enhanced hero section with live market ticker and trust indicators
  * Added comprehensive footer with legal links and support information
  * Implemented professional Bitcoin exchange styling with animations
  * Enhanced security and trust sections with visual indicators
  * Improved security with proper client/server separation
  * Project now runs cleanly in Replit environment without errors
- July 07, 2025. Enhanced Admin Panel User Management:
  * Fixed admin authentication middleware to use proper isAdmin instead of isAuthenticated
  * Corrected admin session handling (adminId vs userId) for all admin routes
  * Created comprehensive user management interface with detailed crypto balances
  * Added interactive user detail dialog with Overview, Crypto Balances, and Admin Actions tabs
  * Implemented real-time USD and ZAR conversion for crypto balances using live market data
  * Enhanced user list with featured user highlighting (Hanlie Dorothea Theron)
  * Added clickable user cards and action buttons for credit/debit operations
  * Improved query caching and performance optimization for admin dashboard
  * User balances now display accurate BTC, ETH, XRP, SOL, USDT, USDC values with proper conversions
  * FIXED: Dialog closing issue with custom StableDialog component - admin actions now work perfectly
  * Enhanced form validation and error handling for credit/debit operations
  * Improved real-time balance updates and cache invalidation
- July 07, 2025. Fixed Critical Admin Dialog Issues:
  * Completely resolved admin action dialog closing problems
  * Enhanced dialog stability with proper event handling and prevention of auto-close
  * Fixed form submission issues in credit/debit operations
  * Added comprehensive input validation for cryptocurrency amounts
  * Implemented immediate balance updates and real-time data refresh
  * Enhanced user experience with stable modal interactions
  * All admin actions now function properly without dialog interruptions
- July 07, 2025. Complete Migration and Enhanced User Management:
  * Successfully completed migration from Replit Agent to Replit environment
  * Enhanced admin dashboard with comprehensive user management system
  * Added comprehensive user details modal with Overview, Transaction History, and Admin Actions tabs
  * Implemented transaction history display from 2024 to present with complete trading records
  * Added auto-close functionality for admin forms with automatic redirect to user details
  * Enhanced location display format to "Johannesburg, South Africa ZA" as requested
  * Added real-time balance updates immediately after credit/debit operations
  * Implemented professional Bitcoin exchange styling throughout admin interface
  * All user management workflows now function seamlessly with enhanced UX
- July 07, 2025. Updated Hanlie Theron's Transaction History and Wallet Configuration:
  * Created specific Bitcoin withdrawal transactions: $75,000 and $75,670
  * Updated Bitcoin wallet address to: bc1q6ml4000ksk4zcn3jk6ml6c3nra8280kd4fntnz
  * Set ETH and XRP balances to $0.74 each with proper ZAR conversions
  * Generated realistic wallet addresses for all cryptocurrencies
  * Updated transaction history to show proper withdrawal records with dates and amounts
  * All cryptocurrency balances now display accurate USD/ZAR conversions using live market data
- July 07, 2025. Enhanced Admin Dashboard with Cryptocurrency Filtering and Bitcoin Vibes:
  * Fixed wallet address display issues in transaction history components
  * Made portfolio summary cryptocurrencies clickable for transaction filtering
  * Added comprehensive transaction filtering by cryptocurrency type
  * Enhanced transaction display with wallet addresses, transaction hashes, and payment methods
  * Implemented professional Bitcoin exchange styling with orange/yellow gradients
  * Added copy-to-clipboard functionality for wallet addresses
  * Created filterable transaction history showing specific crypto transactions
  * All Bitcoin withdrawals now properly display with wallet address bc1q6ml4000ksk4zcn3jk6ml6c3nra8280kd4fntnz
  * Enhanced user experience with clickable crypto icons and detailed transaction information
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
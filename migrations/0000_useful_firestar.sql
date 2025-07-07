CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"role" varchar(20) DEFAULT 'admin',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_users_username_unique" UNIQUE("username"),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cryptocurrencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"logo_url" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "cryptocurrencies_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "market_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"crypto_id" integer NOT NULL,
	"price_zar" numeric(20, 2) NOT NULL,
	"price_usd" numeric(20, 8) NOT NULL,
	"percent_change_24h" numeric(10, 2),
	"volume_24h" numeric(20, 2),
	"market_cap" numeric(30, 2),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "market_data_crypto_id_unique" UNIQUE("crypto_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"crypto_id" integer NOT NULL,
	"type" varchar(20) NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"price" numeric(20, 8),
	"total_zar" numeric(20, 2),
	"total_usd" numeric(20, 8),
	"status" varchar(20) DEFAULT 'completed',
	"admin_user_id" integer,
	"description" text,
	"payment_method" varchar(50),
	"wallet_address" varchar(255),
	"transaction_hash" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"country" varchar DEFAULT 'South Africa',
	"city" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"crypto_id" integer NOT NULL,
	"address" varchar(255) NOT NULL,
	"balance" numeric(20, 8) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "zar_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"balance" numeric(20, 2) DEFAULT '0',
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "zar_balances_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");
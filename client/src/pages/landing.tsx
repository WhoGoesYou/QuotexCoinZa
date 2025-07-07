import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bitcoin, TrendingUp, Shield, Zap, Users, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bitcoin className="h-8 w-8 text-orange-400" />
            <h1 className="text-2xl font-bold text-white">
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                QUOTEX COIN WALLETS
              </span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                Get Started
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
            Serving South Africa & Beyond
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Your Gateway to
            <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              {" "}Digital Wealth
            </span>
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Trade Bitcoin, Ethereum, and other top cryptocurrencies with confidence. 
            Professional-grade trading platform with real-time market data and secure wallet management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-8 py-3">
                Start Trading Now
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/20 px-8 py-3">
                Login to Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Why Choose QUOTEX COIN WALLETS?</h3>
          <p className="text-white/80 max-w-2xl mx-auto">
            Professional cryptocurrency trading platform designed for both beginners and experienced traders
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <Shield className="h-10 w-10 text-green-400 mb-2" />
              <CardTitle>Bank-Grade Security</CardTitle>
              <CardDescription className="text-white/70">
                Your funds are protected with military-grade encryption and multi-layer security protocols
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-blue-400 mb-2" />
              <CardTitle>Real-Time Trading</CardTitle>
              <CardDescription className="text-white/70">
                Live market data with instant execution and advanced trading tools for optimal performance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <Zap className="h-10 w-10 text-yellow-400 mb-2" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription className="text-white/70">
                Ultra-fast transactions and instant deposits/withdrawals with minimal fees
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Supported Cryptocurrencies */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Supported Cryptocurrencies</h3>
          <p className="text-white/80">Trade the most popular digital assets</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {[
            { name: "Bitcoin", symbol: "BTC", color: "text-orange-400" },
            { name: "Ethereum", symbol: "ETH", color: "text-blue-400" },
            { name: "Ripple", symbol: "XRP", color: "text-blue-300" },
            { name: "Solana", symbol: "SOL", color: "text-purple-400" },
            { name: "Tether", symbol: "USDT", color: "text-green-400" },
            { name: "USD Coin", symbol: "USDC", color: "text-blue-500" },
          ].map((crypto) => (
            <Card key={crypto.symbol} className="bg-white/10 backdrop-blur-sm border-white/20 text-white text-center">
              <CardContent className="p-6">
                <div className={`text-2xl font-bold ${crypto.color} mb-2`}>{crypto.symbol}</div>
                <div className="text-sm text-white/70">{crypto.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="text-white">
            <Users className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <div className="text-3xl font-bold mb-2">10,000+</div>
            <div className="text-white/70">Active Traders</div>
          </div>
          <div className="text-white">
            <Globe className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <div className="text-3xl font-bold mb-2">50+</div>
            <div className="text-white/70">Countries Served</div>
          </div>
          <div className="text-white">
            <TrendingUp className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <div className="text-3xl font-bold mb-2">$100M+</div>
            <div className="text-white/70">Trading Volume</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-white/20 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bitcoin className="h-6 w-6 text-orange-400" />
            <span className="text-white font-semibold">QUOTEX COIN WALLETS</span>
          </div>
          <p className="text-white/70 mb-4">
            Your trusted gateway to digital wealth. Trade with confidence.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-white/70">
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
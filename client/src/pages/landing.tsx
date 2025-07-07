import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bitcoin, TrendingUp, Shield, Zap, Users, Globe, Phone, Mail, MessageCircle, HelpCircle, Clock, Award, Lock } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Landing() {
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");

  const helpQuestions = [
    "How do I create an account?",
    "What cryptocurrencies can I trade?",
    "How do I verify my account?",
    "What are the trading fees?",
    "How do I deposit funds?",
    "How do I withdraw my earnings?",
    "Is my money safe?",
    "What is the minimum deposit?",
    "How do I contact support?",
    "Put me in touch with an agent"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative">
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
      <section className="container mx-auto px-4 py-20 text-center relative">
        <div className="max-w-6xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 animate-pulse">
            🌍 Serving South Africa & Beyond
          </Badge>
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Gateway to
            <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
              {" "}Digital Wealth
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Trade Bitcoin, Ethereum, and other top cryptocurrencies with confidence. 
            Professional-grade trading platform with real-time market data and secure wallet management.
          </p>
          
          {/* Live Market Ticker */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-orange-400 font-semibold">BTC/USD</div>
                <div className="text-white font-bold text-lg">$67,240.00</div>
                <div className="text-green-400">+2.45%</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-semibold">ETH/USD</div>
                <div className="text-white font-bold text-lg">$3,420.18</div>
                <div className="text-green-400">+1.82%</div>
              </div>
              <div className="text-center">
                <div className="text-blue-300 font-semibold">XRP/USD</div>
                <div className="text-white font-bold text-lg">$2.24</div>
                <div className="text-red-400">-0.95%</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-semibold">SOL/USD</div>
                <div className="text-white font-bold text-lg">$178.45</div>
                <div className="text-green-400">+3.21%</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-12 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                🚀 Start Trading Now
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/20 px-12 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                🔐 Login to Account
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-white/70">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span>Bank-Level Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-blue-400" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-400" />
              <span>Licensed & Regulated</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
        
        {/* Floating Bitcoin Animation */}
        <div className="absolute top-10 left-10 animate-bounce">
          <Bitcoin className="h-12 w-12 text-orange-400/30" />
        </div>
        <div className="absolute top-20 right-10 animate-pulse">
          <TrendingUp className="h-10 w-10 text-green-400/30" />
        </div>
        <div className="absolute bottom-10 left-1/4 animate-spin" style={{animationDuration: '20s'}}>
          <Globe className="h-8 w-8 text-blue-400/30" />
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
        
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
            <CardHeader>
              <Shield className="h-12 w-12 text-green-400 mb-2" />
              <CardTitle className="text-lg">Bank-Grade Security</CardTitle>
              <CardDescription className="text-white/70">
                Your funds are protected with military-grade encryption and multi-layer security protocols
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-blue-400 mb-2" />
              <CardTitle className="text-lg">Real-Time Trading</CardTitle>
              <CardDescription className="text-white/70">
                Live market data with instant execution and advanced trading tools for optimal performance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-400 mb-2" />
              <CardTitle className="text-lg">Lightning Fast</CardTitle>
              <CardDescription className="text-white/70">
                Ultra-fast transactions and instant deposits/withdrawals with minimal fees
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
            <CardHeader>
              <Clock className="h-12 w-12 text-purple-400 mb-2" />
              <CardTitle className="text-lg">24/7 Support</CardTitle>
              <CardDescription className="text-white/70">
                Round-the-clock customer support with instant response and professional assistance
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
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="text-white">
            <Users className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <div className="text-4xl font-bold mb-2">25,000+</div>
            <div className="text-white/70 text-lg">Active Traders</div>
          </div>
          <div className="text-white">
            <Globe className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <div className="text-4xl font-bold mb-2">80+</div>
            <div className="text-white/70 text-lg">Countries Served</div>
          </div>
          <div className="text-white">
            <TrendingUp className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <div className="text-4xl font-bold mb-2">$500M+</div>
            <div className="text-white/70 text-lg">Trading Volume</div>
          </div>
          <div className="text-white">
            <Award className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <div className="text-4xl font-bold mb-2">99.9%</div>
            <div className="text-white/70 text-lg">Uptime</div>
          </div>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Security & Trust</h3>
          <p className="text-white/80 max-w-2xl mx-auto">
            Your security is our priority. We use industry-leading security measures to protect your investments
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white text-center">
            <CardContent className="p-8">
              <Lock className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">SSL Encryption</h4>
              <p className="text-white/70">256-bit SSL encryption protects all your data and transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white text-center">
            <CardContent className="p-8">
              <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Cold Storage</h4>
              <p className="text-white/70">95% of funds stored in offline cold wallets for maximum security</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white text-center">
            <CardContent className="p-8">
              <Users className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Regulated</h4>
              <p className="text-white/70">Fully licensed and regulated by international financial authorities</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-white/20 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Bitcoin className="h-8 w-8 text-orange-400" />
                <span className="text-white font-bold text-xl">QUOTEX COIN WALLETS</span>
              </div>
              <p className="text-white/70 mb-4">
                Your trusted gateway to digital wealth. Trade with confidence on our secure, professional platform.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/20">
                  Follow Us
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link href="/trading" className="hover:text-white transition-colors">Start Trading</Link></li>
                <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Risk Disclosure</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <div className="space-y-3 text-white/70">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-orange-400" />
                  <a href="mailto:support.quotex@quotexes.online" className="hover:text-white transition-colors">
                    support.quotex@quotexes.online
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-orange-400" />
                  <a href="tel:6723805729" className="hover:text-white transition-colors">
                    +1 (672) 380-5729
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span>24/7 Support Available</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/70 text-sm">
                © 2025 QUOTEX COIN WALLETS. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-white/70 mt-4 md:mt-0">
                <span>Secure Platform</span>
                <span>Licensed & Regulated</span>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Help Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="rounded-full h-14 w-14 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <HelpCircle className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">
                <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Quick Help
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-white/80 text-center">How can we help you today?</p>
              <div className="grid gap-2">
                {helpQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start border-white/30 text-white hover:bg-white/20 text-left"
                    onClick={() => {
                      setSelectedQuestion(question);
                      if (question === "Put me in touch with an agent") {
                        setHelpDialogOpen(false);
                        // Show agent contact
                        setTimeout(() => {
                          alert(`Agent Contact:\n📧 Email: support.quotex@quotexes.online\n📞 Phone: +1 (672) 380-5729\n\nAvailable 24/7 for immediate assistance`);
                        }, 300);
                      }
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </div>
              <div className="pt-4 border-t border-white/20 text-center">
                <p className="text-white/70 text-sm mb-2">Need immediate assistance?</p>
                <div className="flex flex-col space-y-2">
                  <a 
                    href="mailto:support.quotex@quotexes.online" 
                    className="flex items-center justify-center space-x-2 text-orange-400 hover:text-orange-300"
                  >
                    <Mail className="h-4 w-4" />
                    <span>support.quotex@quotexes.online</span>
                  </a>
                  <a 
                    href="tel:6723805729" 
                    className="flex items-center justify-center space-x-2 text-orange-400 hover:text-orange-300"
                  >
                    <Phone className="h-4 w-4" />
                    <span>+1 (672) 380-5729</span>
                  </a>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
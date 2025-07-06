import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Shield, Clock, Headphones, TrendingUp, Users, Wallet, BarChart3 } from "lucide-react";

export default function Landing() {
  const [email, setEmail] = useState("");

  const handleSignUp = () => {
    window.location.href = "/api/login";
  };

  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Coins className="text-white w-5 h-5" />
                </div>
                <div className="bg-gradient-to-r from-primary to-red-700 bg-clip-text text-transparent">
                  <span className="text-xl font-bold">QUOTEX COIN WALLETS</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-primary transition-colors">Prices</a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors">Learn</a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors">Individuals</a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors">Businesses</a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors">Developers</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleSignIn}>
                Sign in
              </Button>
              <Button onClick={handleSignUp}>
                Get started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-red text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm">Serving South Africa & Beyond</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Your gateway to digital wealth
              </h1>
              <p className="text-xl text-white/90">
                Professional cryptocurrency trading platform with secure wallets, real-time market data, and seamless ZAR integration for the modern investor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white text-gray-900 placeholder-gray-500 border-white/20"
                  />
                </div>
                <Button 
                  onClick={handleSignUp}
                  className="bg-white text-primary hover:bg-gray-100"
                >
                  Sign up
                </Button>
              </div>
              <p className="text-sm text-white/70">
                Sign up and get up to R3,000 in crypto¹
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-orange-500/20 to-yellow-600/20 border border-orange-500/30 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">₿</span>
                        </div>
                        <span className="text-sm text-white font-medium">Bitcoin</span>
                      </div>
                      <span className="text-green-400 text-sm font-semibold">+2.5%</span>
                    </div>
                    <div className="text-3xl font-bold text-white">$97,245</div>
                    <div className="text-xs text-gray-400 mt-1">≈ R1,847,892</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Ξ</span>
                        </div>
                        <span className="text-sm text-white font-medium">Ethereum</span>
                      </div>
                      <span className="text-green-400 text-sm font-semibold">+1.8%</span>
                    </div>
                    <div className="text-3xl font-bold text-white">$2,285</div>
                    <div className="text-xs text-gray-400 mt-1">≈ R43,295</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600/20 to-gray-500/20 border border-blue-600/30 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">X</span>
                        </div>
                        <span className="text-sm text-white font-medium">XRP</span>
                      </div>
                      <span className="text-green-400 text-sm font-semibold">+5.2%</span>
                    </div>
                    <div className="text-3xl font-bold text-white">$2.03</div>
                    <div className="text-xs text-gray-400 mt-1">≈ R38.56</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                        <span className="text-sm text-white font-medium">Solana</span>
                      </div>
                      <span className="text-green-400 text-sm font-semibold">+3.1%</span>
                    </div>
                    <div className="text-3xl font-bold text-white">$135.71</div>
                    <div className="text-xs text-gray-400 mt-1">≈ R2,574</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crypto Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Professional cryptocurrency trading platform
            </h2>
            <p className="text-xl text-gray-600">
              Trade Bitcoin, Ethereum, and other digital assets with institutional-grade security and real-time market data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Bitcoin", symbol: "BTC", icon: "₿", price: "$97,245", zarPrice: "R1,847,892", change: "+2.56%", positive: true, color: "orange" },
              { name: "Ethereum", symbol: "ETH", icon: "Ξ", price: "$2,285", zarPrice: "R43,295", change: "+1.62%", positive: true, color: "blue" },
              { name: "XRP", symbol: "XRP", icon: "X", price: "$2.03", zarPrice: "R38.56", change: "+2.70%", positive: true, color: "blue" },
              { name: "Solana", symbol: "SOL", icon: "S", price: "$135.71", zarPrice: "R2,574", change: "+3.03%", positive: true, color: "purple" },
              { name: "Tether", symbol: "USDT", icon: "₮", price: "$1.00", zarPrice: "R19.00", change: "0.00%", positive: true, color: "green" },
              { name: "USD Coin", symbol: "USDC", icon: "$", price: "$1.00", zarPrice: "R19.00", change: "0.00%", positive: true, color: "blue" },
            ].map((crypto) => (
              <Card key={crypto.symbol} className="crypto-card hover:shadow-lg transition-all duration-300 border-l-4" style={{borderLeftColor: crypto.color === 'orange' ? '#f97316' : crypto.color === 'blue' ? '#3b82f6' : crypto.color === 'purple' ? '#8b5cf6' : '#10b981'}}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold`} style={{backgroundColor: crypto.color === 'orange' ? '#f97316' : crypto.color === 'blue' ? '#3b82f6' : crypto.color === 'purple' ? '#8b5cf6' : '#10b981'}}>
                        {crypto.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{crypto.name}</h3>
                        <p className="text-sm text-gray-500">{crypto.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">{crypto.price}</div>
                      <div className="text-xs text-gray-500">{crypto.zarPrice}</div>
                      <div className={`text-sm font-semibold ${crypto.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {crypto.change}
                      </div>
                    </div>
                  </div>
                  <div className="h-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs">24h Trend</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why choose QUOTEX COIN za?
            </h2>
            <p className="text-xl text-gray-600">
              Built for South Africans, with world-class security and support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
              <p className="text-gray-600">
                Your crypto is protected with industry-leading security measures and cold storage.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Trading</h3>
              <p className="text-gray-600">
                Trade cryptocurrencies anytime with real-time price updates and instant execution.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Support</h3>
              <p className="text-gray-600">
                Get help from our South African crypto experts in your local timezone.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ZAR Integration</h3>
              <p className="text-gray-600">
                Seamlessly deposit and withdraw South African Rand with no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-4">
                <Users className="text-primary w-12 h-12" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">100K+</div>
              <div className="text-gray-600">Trusted South African users</div>
            </div>
            
            <div>
              <div className="flex items-center justify-center mb-4">
                <BarChart3 className="text-primary w-12 h-12" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">R2.5B+</div>
              <div className="text-gray-600">Total trading volume</div>
            </div>
            
            <div>
              <div className="flex items-center justify-center mb-4">
                <Shield className="text-primary w-12 h-12" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
              <div className="text-gray-600">Secure and compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Start your crypto journey today
          </h2>
          <p className="text-xl mb-8">
            Join thousands of South Africans already trading on QUOTEX COIN za
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            <Button 
              onClick={handleSignUp}
              className="bg-white text-primary hover:bg-gray-100"
            >
              Sign up
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Coins className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold">QUOTEX COIN za</span>
              </div>
              <p className="text-gray-400">
                South Africa's trusted cryptocurrency exchange platform.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Trading</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Wallet</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Earn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Learn</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Legal</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 QUOTEX COIN za. All rights reserved. Proudly South African 🇿🇦</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

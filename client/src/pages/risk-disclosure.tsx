import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bitcoin, AlertTriangle } from "lucide-react";

export default function RiskDisclosure() {
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
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 text-white">
          <div className="flex items-center justify-center mb-8">
            <AlertTriangle className="h-12 w-12 text-red-400 mr-4" />
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Risk Disclosure
            </h1>
          </div>
          
          <div className="space-y-6 text-white/90">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-red-400 mb-2">⚠️ IMPORTANT WARNING</h2>
              <p className="text-white">Cryptocurrency trading involves substantial risk of loss and is not suitable for every investor. You should carefully consider whether trading is suitable for you.</p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">1. Market Volatility</h2>
              <p>Cryptocurrency markets are highly volatile. Prices can fluctuate rapidly and unpredictably, leading to significant gains or losses within short periods.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">2. Loss of Capital</h2>
              <p>You may lose all or part of your investment. Never invest more than you can afford to lose. Past performance does not guarantee future results.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">3. Regulatory Risks</h2>
              <p>Cryptocurrency regulations vary by jurisdiction and may change. Regulatory actions could affect the value and liquidity of cryptocurrencies.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">4. Technology Risks</h2>
              <p>Blockchain and cryptocurrency technologies are still evolving. Technical issues, security breaches, or system failures could impact your investments.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">5. Liquidity Risks</h2>
              <p>Some cryptocurrencies may have limited liquidity, making it difficult to buy or sell large amounts without significantly affecting the price.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">6. Operational Risks</h2>
              <p>Platform outages, system maintenance, or technical difficulties may prevent you from accessing your account or executing trades when needed.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">7. Professional Advice</h2>
              <p>Before making any investment decisions, consult with qualified financial advisors who understand cryptocurrency markets and your personal financial situation.</p>
            </section>

            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 mt-8">
              <p className="text-center text-white font-semibold">For questions or concerns, contact our support team at support.quotex@quotexes.online or +1 (672) 380-5729</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
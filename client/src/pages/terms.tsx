import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bitcoin } from "lucide-react";

export default function Terms() {
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
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          
          <div className="space-y-6 text-white/90">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">1. Acceptance of Terms</h2>
              <p>By accessing and using QUOTEX COIN WALLETS, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">2. Trading Services</h2>
              <p>QUOTEX COIN WALLETS provides cryptocurrency trading services. All trades are executed at your own risk, and past performance does not guarantee future results.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">3. Account Security</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity that occurs under your account is your responsibility.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">4. Risk Disclosure</h2>
              <p>Cryptocurrency trading involves substantial risk of loss and is not suitable for every investor. You should carefully consider whether trading is suitable for you.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">5. Fees and Charges</h2>
              <p>We reserve the right to charge fees for our services. All applicable fees will be clearly disclosed before any transaction.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">6. Limitation of Liability</h2>
              <p>QUOTEX COIN WALLETS shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of our services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">7. Contact Information</h2>
              <p>For questions regarding these terms, please contact us at support.quotex@quotexes.online or +1 (672) 380-5729.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
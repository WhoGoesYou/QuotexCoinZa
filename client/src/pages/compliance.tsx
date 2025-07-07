import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bitcoin, Shield } from "lucide-react";

export default function Compliance() {
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
            <Shield className="h-12 w-12 text-green-400 mr-4" />
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Compliance & Regulations
            </h1>
          </div>
          
          <div className="space-y-6 text-white/90">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">1. Regulatory Compliance</h2>
              <p>QUOTEX COIN WALLETS operates in full compliance with applicable financial regulations and maintains necessary licenses in jurisdictions where we provide services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">2. Anti-Money Laundering (AML)</h2>
              <p>We implement robust AML procedures to prevent money laundering and terrorist financing. All transactions are monitored and reported as required by law.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">3. Know Your Customer (KYC)</h2>
              <p>We require customer identification and verification as part of our KYC procedures. This helps ensure the security and integrity of our platform.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">4. Data Protection</h2>
              <p>We comply with international data protection laws including GDPR and maintain strict confidentiality of customer information.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">5. Financial Crime Prevention</h2>
              <p>Our systems actively monitor for suspicious activities and report potential financial crimes to relevant authorities as required by law.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">6. Audit and Reporting</h2>
              <p>We undergo regular audits and maintain transparent reporting to regulatory bodies to ensure continued compliance with evolving regulations.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">7. Customer Protection</h2>
              <p>We maintain customer protection measures including segregated accounts, insurance coverage, and transparent fee structures.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">8. Regulatory Updates</h2>
              <p>We continuously monitor regulatory developments and update our policies and procedures to maintain compliance with changing requirements.</p>
            </section>

            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 mt-8">
              <p className="text-center text-white font-semibold">For compliance-related inquiries, contact our compliance team at support.quotex@quotexes.online or +1 (672) 380-5729</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
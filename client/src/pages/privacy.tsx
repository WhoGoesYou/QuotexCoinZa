import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bitcoin } from "lucide-react";

export default function Privacy() {
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
            Privacy Policy
          </h1>
          
          <div className="space-y-6 text-white/90">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, make transactions, or contact us for support.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">3. Information Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">4. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">5. Cookies and Tracking</h2>
              <p>We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve user experience.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">6. Your Rights</h2>
              <p>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">7. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at support.quotex@quotexes.online or +1 (672) 380-5729.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
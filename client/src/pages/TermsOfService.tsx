import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-8">
        <Button variant="ghost" asChild className="pl-0 mb-4">
          <Link href="/">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">Effective Date: May 1, 2025</p>
      </div>

      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
        <p className="lead">
          Welcome to iREVA!
          These Terms of Service ("Terms") govern your use of the iREVA platform and services ("Services").
        </p>
        
        <p>
          By accessing or using iREVA, you agree to be bound by these Terms. If you do not agree, do not use the platform.
        </p>

        <div className="my-8 border-t border-b py-2">
          <h2 className="text-xl font-semibold mb-2">1. Eligibility</h2>
          
          <p>You must:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Be at least 18 years old.</li>
            <li>Have full legal capacity to form binding contracts.</li>
            <li>Not be restricted from investing under applicable laws (including securities laws).</li>
          </ul>
          
          <p>You must also complete all required KYC (Know Your Customer) verification processes.</p>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">2. Account Registration</h2>
          
          <p>You agree to:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Provide accurate and complete information.</li>
            <li>Maintain confidentiality of your login credentials.</li>
            <li>Notify us immediately if you suspect unauthorized use.</li>
          </ul>
          
          <p>You are responsible for all activities conducted under your account.</p>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">3. Investment Disclosures</h2>
          
          <ul className="list-disc pl-5 mb-4">
            <li>All investments involve risks, including possible loss of capital.</li>
            <li>Past performance does not guarantee future results.</li>
            <li>You are solely responsible for your investment decisions.</li>
          </ul>
          
          <p>You should consult independent financial or legal advisors if needed.</p>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">4. Platform Use</h2>
          
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Violate any law, regulation, or these Terms.</li>
            <li>Use the platform to transmit malicious software.</li>
            <li>Interfere with the functionality or security of the platform.</li>
          </ul>
          
          <p>We may suspend or terminate your account if you breach these Terms.</p>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">5. Fees</h2>
          
          <p>
            iREVA may charge platform fees, transaction fees, or asset management fees.
            Details will be disclosed clearly before investment.
          </p>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">6. Crypto Transactions</h2>
          
          <p>If you invest using cryptocurrencies:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>You accept the inherent volatility and risk.</li>
            <li>Blockchain transactions are irreversible.</li>
            <li>iREVA is not responsible for lost private keys or incorrect wallet addresses.</li>
          </ul>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">7. No Financial Advice</h2>
          
          <p>
            iREVA is a technology platform.
            We do not provide investment, tax, or legal advice.
          </p>
          
          <p>You acknowledge that any investment decision is made solely at your own risk.</p>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">8. Limitation of Liability</h2>
          
          <p>To the maximum extent permitted by law:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>iREVA shall not be liable for indirect, incidental, special, or consequential damages.</li>
            <li>Our liability shall not exceed the fees paid by you to us over the past 12 months.</li>
          </ul>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">9. Amendments</h2>
          
          <p>
            We may update these Terms at any time.
            Material changes will be communicated via email or platform notification.
          </p>
        </div>

        <div className="my-8">
          <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
          
          <p>For questions about these Terms:</p>
          <p>Email: ireva.investments@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-8">
        <Button variant="ghost" asChild className="pl-0 mb-4">
          <Link href="/">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">Effective Date: May 1, 2025</p>
      </div>

      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
        <p className="lead">
          Welcome to iREVA ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy.
          This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit or use our platform,
          including any services, products, or features offered through iREVA.
        </p>
        
        <p>
          Please read this policy carefully. If you do not agree with the terms, please do not use our platform.
        </p>

        <div className="my-8 border-t border-b py-2">
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          
          <p>We collect information that you voluntarily provide to us when you:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Register for an account</li>
            <li>Complete KYC/identity verification</li>
            <li>Invest in a project</li>
            <li>Request withdrawals</li>
            <li>Subscribe to newsletters</li>
            <li>Contact customer support</li>
          </ul>
          
          <p>This information may include:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Full name, address, phone number, and email address</li>
            <li>Government-issued ID and documents for verification</li>
            <li>Wallet addresses for crypto transactions</li>
            <li>Investment history and transaction details</li>
            <li>Communication preferences</li>
          </ul>
          
          <p>We may also automatically collect:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Device and usage data (IP address, browser type, device ID)</li>
            <li>Cookies and tracking technologies for platform optimization</li>
          </ul>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
          
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Create and manage your account</li>
            <li>Process investments, withdrawals, and payouts</li>
            <li>Verify your identity to comply with regulatory requirements</li>
            <li>Communicate updates, confirmations, and marketing materials</li>
            <li>Improve platform features, security, and user experience</li>
            <li>Enforce our Terms of Service and policies</li>
          </ul>
          
          <p>We do not sell or rent your personal information to third parties.</p>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">3. How We Share Your Information</h2>
          
          <p>We only share your data with:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Identity verification service providers (for KYC/AML compliance)</li>
            <li>Payment processors (for fiat and crypto transactions)</li>
            <li>Hosting and IT service providers (for platform operation)</li>
            <li>Legal authorities if required by law (e.g., anti-fraud, tax reporting)</li>
          </ul>
          
          <p>All partners are contractually required to safeguard your data.</p>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">4. Crypto Transactions and Blockchain Data</h2>
          
          <p>Please note:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Cryptocurrency transactions are recorded on public blockchains.</li>
            <li>Blockchain data may be accessible globally and immutable.</li>
            <li>By investing with crypto, you acknowledge and accept the transparency nature of blockchain technology.</li>
          </ul>
          
          <p>We will only request blockchain addresses or crypto wallet data necessary for your investments or withdrawals.</p>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">5. Data Retention</h2>
          
          <p>We retain your information:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>As long as your account remains active</li>
            <li>For as long as necessary to fulfill legal and regulatory obligations</li>
            <li>Or until you request deletion (subject to compliance restrictions)</li>
          </ul>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">6. Your Privacy Rights</h2>
          
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Access and request a copy of your data</li>
            <li>Correct inaccuracies in your profile</li>
            <li>Request deletion of your account (where permissible)</li>
            <li>Withdraw consent to marketing communications</li>
          </ul>
          
          <p>To exercise your rights, contact us at: ireva.investments@gmail.com</p>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">7. Data Security</h2>
          
          <p>
            We implement administrative, technical, and physical security measures to protect your data.
            However, no method of transmission over the internet is 100% secure.
            We encourage users to maintain strong passwords and monitor account activities.
          </p>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">8. Third-Party Links</h2>
          
          <p>
            Our platform may contain links to third-party websites or services.
            We are not responsible for the privacy practices of those external sites.
          </p>
        </div>

        <div className="my-8 border-b py-2">
          <h2 className="text-xl font-semibold mb-2">9. Changes to This Policy</h2>
          
          <p>
            We may update this Privacy Policy from time to time.
            We will notify you of any material changes through the platform or by email.
          </p>
        </div>

        <div className="my-8">
          <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
          
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <div className="mt-2">
            <p>iREVA Support Team</p>
            <p>Email: ireva.investments@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
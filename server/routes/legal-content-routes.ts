import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const legalContentRouter = express.Router();

// This route serves legal document content as HTML
legalContentRouter.get('/content/:documentType', async (req: Request, res: Response) => {
  const { documentType } = req.params;
  
  // Security - validate documentType to prevent directory traversal
  if (!documentType.match(/^[a-z_]+$/)) {
    return res.status(400).send('Invalid document type');
  }
  
  try {
    // Map document types to HTML content
    const documentContentMap: Record<string, string> = {
      terms_of_service: `
        <h1>Terms of Service</h1>
        <p><strong>Effective Date: April 28, 2025</strong></p>
        
        <h2>1. Introduction</h2>
        <p>Welcome to iREVA! These Terms of Service ("Terms") govern your use of the iREVA platform, including our website, applications, and services (collectively, the "Services"). By accessing or using the Services, you agree to be bound by these Terms.</p>
        
        <h2>2. Key Definitions</h2>
        <p>"Platform" refers to the iREVA real estate investment platform.</p>
        <p>"User," "you," and "your" refers to individuals who register an account on the Platform.</p>
        <p>"Property" refers to any real estate asset listed on the Platform for investment.</p>
        <p>"Investment" refers to the financial contribution made by Users toward Properties on the Platform.</p>
        
        <h2>3. Account Registration and Eligibility</h2>
        <p>3.1. You must be at least 18 years old to create an account.</p>
        <p>3.2. You must provide accurate, current, and complete information during registration.</p>
        <p>3.3. You are responsible for maintaining the confidentiality of your account credentials.</p>
        <p>3.4. You must promptly notify us of any unauthorized use of your account.</p>
        
        <h2>4. Investment Terms</h2>
        <p>4.1. All investments are subject to a 5-year maturity period unless otherwise specified.</p>
        <p>4.2. Returns on investment (ROI) are not guaranteed and may vary based on market conditions.</p>
        <p>4.3. Early withdrawal may be subject to penalties as detailed in the specific investment agreement.</p>
        <p>4.4. All investment transactions on the Platform are final once confirmed.</p>
        
        <h2>5. Cryptocurrency Payments and Smart Contracts</h2>
        <p>5.1. Users may utilize cryptocurrency for property investments, including but not limited to Bitcoin (BTC), Ethereum (ETH), and stablecoins like USDC and USDT.</p>
        <p>5.2. Cryptocurrency transactions are governed by smart contracts deployed on respective blockchains.</p>
        <p>5.3. Users acknowledge the inherent risks associated with cryptocurrency investments, including volatility and regulatory uncertainty.</p>
        <p>5.4. iREVA is not responsible for losses resulting from blockchain network failures, wallet compromises, or user error in transaction execution.</p>
        
        <h2>6. KYC and Compliance</h2>
        <p>6.1. Users must complete our Know Your Customer (KYC) verification process before making investments.</p>
        <p>6.2. We reserve the right to request additional documentation to verify your identity at any time.</p>
        <p>6.3. Use of the Platform is prohibited in jurisdictions where such use would be illegal.</p>
        
        <h2>7. Privacy and Data Protection</h2>
        <p>7.1. Your use of the Services is also governed by our Privacy Policy.</p>
        <p>7.2. We collect and process your personal data in accordance with applicable data protection laws.</p>
        
        <h2>8. Intellectual Property</h2>
        <p>8.1. The Platform and its content, features, and functionality are owned by iREVA and are protected by copyright, trademark, and other intellectual property laws.</p>
        <p>8.2. You may not reproduce, distribute, modify, or create derivative works of the Platform without our express permission.</p>
        
        <h2>9. Disclaimers and Limitation of Liability</h2>
        <p>9.1. The Services are provided "as is" without warranties of any kind.</p>
        <p>9.2. iREVA shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
        <p>9.3. Our liability to you for any cause whatsoever shall not exceed the amount paid by you to us, if any.</p>
        
        <h2>10. Indemnification</h2>
        <p>You agree to indemnify, defend, and hold harmless iREVA from any claims, damages, or expenses arising from your use of the Services or violation of these Terms.</p>
        
        <h2>11. Modification of Terms</h2>
        <p>11.1. We may modify these Terms at any time by posting the revised version on the Platform.</p>
        <p>11.2. Your continued use of the Services after the effective date of the revised Terms constitutes your acceptance of the changes.</p>
        
        <h2>12. Termination</h2>
        <p>12.1. You may terminate your account at any time by following the instructions on the Platform.</p>
        <p>12.2. We may suspend or terminate your access to the Services at our discretion without notice for violations of these Terms.</p>
        
        <h2>13. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions.</p>
        
        <h2>14. Dispute Resolution</h2>
        <p>Any dispute arising out of or relating to these Terms shall be resolved through binding arbitration in accordance with the rules of the Arbitration and Conciliation Act of Nigeria.</p>
        
        <h2>15. Contact Information</h2>
        <p>If you have any questions about these Terms, please contact us at legal@ireva.com.</p>
      `,
      
      privacy_policy: `
        <h1>Privacy Policy</h1>
        <p><strong>Effective Date: April 28, 2025</strong></p>
        
        <h2>1. Introduction</h2>
        <p>At iREVA ("we," "our," or "us"), we value your privacy and are committed to protecting your personal information. This Privacy Policy describes how we collect, use, and disclose information when you use our services.</p>
        
        <h2>2. Information We Collect</h2>
        <p><strong>2.1 Personal Information:</strong> When you register for an account, we collect information such as your name, email address, phone number, and national identification information.</p>
        <p><strong>2.2 KYC Information:</strong> For compliance purposes, we collect identity verification documents, proof of address, financial information, and source of funds declarations.</p>
        <p><strong>2.3 Transaction Information:</strong> We collect details about investments, payments, withdrawals, and wallet addresses used for cryptocurrency transactions.</p>
        <p><strong>2.4 Usage Information:</strong> We collect information about how you use our platform, including log data, device information, and location data.</p>
        
        <h2>3. How We Use Your Information</h2>
        <p><strong>3.1</strong> Provide and improve our services</p>
        <p><strong>3.2</strong> Process your investments and transactions</p>
        <p><strong>3.3</strong> Verify your identity and comply with regulatory requirements</p>
        <p><strong>3.4</strong> Communicate with you about your account and investments</p>
        <p><strong>3.5</strong> Detect and prevent fraud, security breaches, and potential illegal activities</p>
        <p><strong>3.6</strong> Analyze usage patterns to improve user experience</p>
        
        <h2>4. Information Sharing and Disclosure</h2>
        <p><strong>4.1 Service Providers:</strong> We may share information with third-party service providers who help us deliver our services, such as payment processors, KYC verification services, and cloud infrastructure providers.</p>
        <p><strong>4.2 Legal Requirements:</strong> We may disclose information if required by law, regulation, legal process, or governmental request.</p>
        <p><strong>4.3 Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
        <p><strong>4.4 With Your Consent:</strong> We may share information with third parties when you provide your consent.</p>
        
        <h2>5. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction.</p>
        
        <h2>6. Your Rights and Choices</h2>
        <p><strong>6.1 Access and Update:</strong> You can access and update your personal information through your account settings.</p>
        <p><strong>6.2 Data Portability:</strong> You can request a copy of your personal data in a structured, commonly used, and machine-readable format.</p>
        <p><strong>6.3 Deletion:</strong> You can request the deletion of your personal information, subject to legal obligations that may require us to retain certain information.</p>
        
        <h2>7. Data Retention</h2>
        <p>We retain your information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.</p>
        
        <h2>8. International Data Transfers</h2>
        <p>Your information may be transferred to and processed in countries other than your country of residence, where data protection laws may differ.</p>
        
        <h2>9. Children's Privacy</h2>
        <p>Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.</p>
        
        <h2>10. Blockchain Transactions and Privacy</h2>
        <p>When you use cryptocurrency for transactions on our platform, certain information such as blockchain addresses and transaction amounts become part of the public blockchain and cannot be deleted or modified.</p>
        
        <h2>11. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our platform or by other communication methods.</p>
        
        <h2>12. Contact Us</h2>
        <p>If you have any questions or concerns about our Privacy Policy or data practices, please contact us at privacy@ireva.com.</p>
      `,
      
      investor_risk_disclosure: `
        <h1>Investor Risk Disclosure</h1>
        <p><strong>Last Updated: April 28, 2025</strong></p>
        
        <h2>Important Information About Investment Risks</h2>
        <p>This document outlines important risks associated with investing through the iREVA platform. Before making any investment, you should carefully consider these risks and consult with financial, legal, and tax advisors as appropriate.</p>
        
        <h2>1. General Investment Risks</h2>
        <ul>
          <li><strong>Loss of Capital:</strong> All investments involve risk, and you may lose some or all of your invested capital.</li>
          <li><strong>Illiquidity:</strong> Real estate investments on iREVA are generally illiquid and have a 5-year maturity period. You may not be able to sell or transfer your investment before maturity.</li>
          <li><strong>No Guaranteed Returns:</strong> Past performance is not indicative of future results. Projected returns are estimates and not guarantees.</li>
          <li><strong>Market Risks:</strong> Real estate values are subject to market conditions, economic changes, and other factors outside our control.</li>
        </ul>
        
        <h2>2. Specific Real Estate Risks</h2>
        <ul>
          <li><strong>Property-Specific Risks:</strong> Individual properties face unique risks related to location, condition, management, and tenant occupancy.</li>
          <li><strong>Development Risks:</strong> For properties under development, risks include construction delays, cost overruns, and failure to obtain necessary permits.</li>
          <li><strong>Geographic Concentration:</strong> Our platform focuses on African markets, particularly Nigeria, which exposes investments to region-specific risks.</li>
          <li><strong>Regulatory Changes:</strong> Changes in laws, regulations, or taxes affecting real estate may impact investment performance.</li>
        </ul>
        
        <h2>3. Platform-Related Risks</h2>
        <ul>
          <li><strong>Operational Risks:</strong> Our platform may experience technical issues or security breaches that could affect investments.</li>
          <li><strong>Business Continuity:</strong> iREVA's continued operation depends on market conditions, regulatory environment, and business success.</li>
          <li><strong>Third-Party Risks:</strong> We rely on various third parties, including property managers, developers, and payment processors, whose performance may affect investments.</li>
        </ul>
        
        <h2>4. ROI and Distribution Risks</h2>
        <ul>
          <li><strong>Distribution Delays:</strong> Distributions may be delayed due to property performance, cash flow issues, or administrative matters.</li>
          <li><strong>Reinvestment Risk:</strong> Distributions may not be available for reinvestment at comparable rates of return.</li>
          <li><strong>Tax Implications:</strong> Investments may have tax consequences that vary based on your individual circumstances and jurisdiction.</li>
        </ul>
        
        <h2>5. Investor Responsibility</h2>
        <p>It is your responsibility to:</p>
        <ul>
          <li>Read all investment documentation carefully before investing</li>
          <li>Diversify your investments to reduce risk</li>
          <li>Only invest funds you can afford to lose</li>
          <li>Understand the terms, fees, and risks associated with each investment</li>
          <li>Keep your account information secure and confidential</li>
        </ul>
        
        <h2>6. Limitation of Liability</h2>
        <p>iREVA does not provide investment, legal, or tax advice. Our providing of investment opportunities does not constitute a recommendation to invest in any particular opportunity. We are not responsible for investment performance or losses you may incur.</p>
        
        <h2>Acknowledgment</h2>
        <p>By investing through the iREVA platform, you acknowledge that you have read and understood this Risk Disclosure and accept the risks associated with your investment decisions.</p>
      `,
      
      crypto_risk_disclosure: `
        <h1>Cryptocurrency Risk Disclosure</h1>
        <p><strong>Last Updated: April 28, 2025</strong></p>
        
        <h2>Important Information About Cryptocurrency Risks</h2>
        <p>This document outlines important risks associated with using cryptocurrencies for transactions and investments through the iREVA platform. Before using cryptocurrencies on our platform, you should carefully consider these risks.</p>
        
        <h2>1. General Cryptocurrency Risks</h2>
        <ul>
          <li><strong>Volatility:</strong> Cryptocurrency prices can be extremely volatile and may fluctuate significantly over short periods of time.</li>
          <li><strong>Irreversible Transactions:</strong> Cryptocurrency transactions are generally irreversible once confirmed on the blockchain. Errors cannot be corrected.</li>
          <li><strong>Technological Risks:</strong> Blockchain technology is relatively new and evolving. Technical vulnerabilities could affect your transactions or investments.</li>
          <li><strong>Regulatory Uncertainty:</strong> Cryptocurrency regulations vary by jurisdiction and are subject to change, which may impact the legality, value, or use of cryptocurrencies.</li>
        </ul>
        
        <h2>2. Wallet and Security Risks</h2>
        <ul>
          <li><strong>Private Key Security:</strong> Loss of private keys or wallet credentials may result in permanent loss of funds.</li>
          <li><strong>Hacking and Fraud:</strong> Cryptocurrency systems may be vulnerable to hacking, phishing, and other fraudulent activities.</li>
          <li><strong>Exchange Risks:</strong> If you use third-party exchanges to acquire cryptocurrencies for use on our platform, those exchanges may have their own security vulnerabilities.</li>
        </ul>
        
        <h2>3. Smart Contract Risks</h2>
        <ul>
          <li><strong>Code Vulnerabilities:</strong> Smart contracts used for property investments may contain bugs, errors, or security vulnerabilities.</li>
          <li><strong>Oracle Dependency:</strong> Some smart contracts rely on external data sources (oracles) which may be compromised or provide inaccurate information.</li>
          <li><strong>Network Congestion:</strong> Blockchain networks may experience congestion, causing delays or increased transaction costs.</li>
        </ul>
        
        <h2>4. Cryptocurrency Investment Considerations</h2>
        <ul>
          <li><strong>Conversion Risk:</strong> When cryptocurrency is converted to fiat currency (or vice versa) for property investments, fluctuations in value may occur during the conversion process.</li>
          <li><strong>Stablecoin Risks:</strong> Even stablecoins like USDC or USDT may lose their peg to fiat currencies under certain market conditions.</li>
          <li><strong>Custody Solutions:</strong> Third-party custody solutions used to secure cryptocurrency may have their own risks and limitations.</li>
        </ul>
        
        <h2>5. Compliance and Tax Considerations</h2>
        <ul>
          <li><strong>KYC/AML Requirements:</strong> Using cryptocurrency does not exempt you from our KYC/AML requirements.</li>
          <li><strong>Tax Obligations:</strong> Cryptocurrency transactions may have tax implications in your jurisdiction. It is your responsibility to determine and meet your tax obligations.</li>
          <li><strong>Cross-Border Transactions:</strong> Using cryptocurrency for cross-border transactions may subject you to regulations in multiple jurisdictions.</li>
        </ul>
        
        <h2>6. Platform-Specific Risks</h2>
        <ul>
          <li><strong>Integration Risks:</strong> Our platform's integration with blockchain networks may experience technical issues or downtime.</li>
          <li><strong>Transaction Verification Delays:</strong> Blockchain confirmations may take longer than expected, delaying the completion of your transactions.</li>
          <li><strong>Gas Fees:</strong> For Ethereum-based transactions, gas fees may fluctuate significantly, affecting the total cost of your transaction.</li>
        </ul>
        
        <h2>Acknowledgment</h2>
        <p>By using cryptocurrencies on the iREVA platform, you acknowledge that you have read and understood this Cryptocurrency Risk Disclosure and accept the risks associated with cryptocurrency transactions and investments.</p>
      `
    };
    
    // Get the content for the requested document type
    const content = documentContentMap[documentType];
    
    if (!content) {
      return res.status(404).send('Document not found');
    }
    
    // Send the content as HTML
    res.setHeader('Content-Type', 'text/html');
    res.send(content);
  } catch (error) {
    console.error('Error serving legal content:', error);
    res.status(500).send('Error serving document content');
  }
});
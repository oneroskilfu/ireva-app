import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function FAQPage() {
  const faqs = [
    {
      id: "faq-1",
      question: "What is iREVA?",
      answer: "iREVA is a cutting-edge real estate investment platform that allows investors to participate in high-quality property investments across Nigeria with minimal capital. Our platform makes real estate investment accessible, transparent, and profitable for everyone."
    },
    {
      id: "faq-2",
      question: "How does investing through iREVA work?",
      answer: "Investing through iREVA is simple. First, create an account and complete the verification process. Browse available properties, select the ones you're interested in, and invest your desired amount (minimum ₦100,000). Track your investment performance through our dashboard, and receive regular updates and quarterly returns directly to your wallet."
    },
    {
      id: "faq-3",
      question: "What is the minimum investment amount?",
      answer: "The minimum investment amount on iREVA is ₦100,000. This allows you to get started with real estate investing with a relatively small amount of capital compared to traditional real estate investments."
    },
    {
      id: "faq-4",
      question: "How long is the investment period?",
      answer: "Most properties on iREVA have a 5-year maturity period. During this time, you'll receive quarterly returns from rental income. At the end of the investment term, you'll receive your principal investment plus any appreciation in the property value."
    },
    {
      id: "faq-5",
      question: "What returns can I expect?",
      answer: "Expected returns vary by property, but typically range between 12-20% annually, comprised of rental income and property appreciation. Each property listing displays the projected ROI, and you can track actual performance in real-time through your dashboard."
    },
    {
      id: "faq-6",
      question: "How is my investment secured?",
      answer: "All properties on iREVA are carefully vetted by our team of real estate experts. We structure each investment through a Special Purpose Vehicle (SPV) which gives investors legal rights to the underlying assets. Additionally, all properties are insured against damages."
    },
    {
      id: "faq-7",
      question: "What documents do I need for verification?",
      answer: "For KYC verification, you'll need a valid government-issued ID (National ID, driver's license, or international passport), proof of address (utility bill not older than 3 months), and a recent passport photograph. Accredited investors will need to provide additional documentation."
    },
    {
      id: "faq-8",
      question: "Can I sell my investment before the maturity period?",
      answer: "Yes, iREVA offers a secondary marketplace where you can list your investment for sale to other investors. A 2.5% transfer fee applies to early exits. The ability to sell depends on demand from other investors."
    },
    {
      id: "faq-9",
      question: "What are the different tiers of investment?",
      answer: "iREVA offers three investment tiers: Standard (minimum ₦100,000), Premium (minimum ₦1,000,000), and Elite (minimum ₦5,000,000). Higher tiers offer access to exclusive properties, reduced fees, and additional benefits such as property visits and higher rewards points."
    },
    {
      id: "faq-10",
      question: "How do I receive my returns?",
      answer: "Returns are distributed quarterly directly to your iREVA wallet. You can then choose to reinvest them in other properties or withdraw them to your bank account. The process is automated and you'll receive notifications when distributions are made."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find answers to the most common questions about investing with iREVA.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <Accordion type="single" collapsible className="w-full space-y-6">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-100">
                  <AccordionTrigger className="px-6 py-4 text-lg font-medium text-gray-900 hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-2 text-gray-600">
                    <p>{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact section */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="max-w-2xl mx-auto mb-8">
                Our customer support team is always ready to help you with any questions or concerns you may have about investing on iREVA.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/help/contact" className="inline-block bg-white text-primary px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                  Contact Support
                </a>
                <a href="/help/investor-guides" className="inline-block bg-transparent text-white border border-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-colors">
                  View Investor Guides
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, HelpCircle, FileText, Bookmark, Star } from 'lucide-react';

// FAQ data structure
interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: 'How do I get started with investing on iREVA?',
    answer: 'To start investing, you need to complete the KYC verification process. Navigate to the KYC section in your dashboard, fill out the required information, and submit the necessary documents. Once verified, you can browse available properties and make your first investment.',
    category: 'getting_started',
    tags: ['kyc', 'verification', 'new investor'],
    helpful: 127
  },
  {
    id: 2,
    question: 'What is the minimum investment amount?',
    answer: 'The minimum investment amount varies by property. Some opportunities start as low as ₦50,000, while premium properties may require higher minimums. You can find this information in the property details page of each investment opportunity.',
    category: 'investments',
    tags: ['minimum', 'investment'],
    helpful: 98
  },
  {
    id: 3,
    question: 'How are returns calculated and distributed?',
    answer: 'Returns are calculated based on the property performance and your investment amount. Distributions are typically made quarterly and can be viewed in your portfolio dashboard. You can choose to reinvest your returns or withdraw them to your bank account.',
    category: 'returns',
    tags: ['roi', 'distribution', 'earnings'],
    helpful: 156
  },
  {
    id: 4,
    question: 'What happens if I want to exit an investment early?',
    answer: 'Each property has different liquidity provisions. Some allow early exit with a fee, while others require you to hold until maturity or find another investor to purchase your share. Check the specific terms of each property before investing.',
    category: 'investments',
    tags: ['exit', 'liquidity', 'early withdrawal'],
    helpful: 83
  },
  {
    id: 5,
    question: 'How is my data protected?',
    answer: 'We use bank-level encryption and security protocols to protect your personal and financial information. We comply with all data protection regulations and never share your information with unauthorized third parties.',
    category: 'security',
    tags: ['data protection', 'privacy', 'security'],
    helpful: 64
  },
  {
    id: 6,
    question: 'What fees does iREVA charge?',
    answer: 'iREVA charges a one-time investment fee of 1-2% depending on the property, and an annual management fee of 0.5-1%. There are no hidden charges, and all fees are transparently displayed before you complete any investment.',
    category: 'fees',
    tags: ['fees', 'charges', 'costs'],
    helpful: 112
  },
  {
    id: 7,
    question: 'How can I update my bank details?',
    answer: 'You can update your bank details in the Settings section of your profile. Any changes will require verification for security purposes, which may take 1-2 business days to process.',
    category: 'account',
    tags: ['bank', 'account', 'settings'],
    helpful: 47
  },
  {
    id: 8,
    question: 'What if I forget my password?',
    answer: 'Click on the "Forgot Password" link on the login page. You will receive a password reset link on your registered email address. For security reasons, the link expires after 24 hours.',
    category: 'account',
    tags: ['password', 'reset', 'forgot'],
    helpful: 89
  },
  {
    id: 9,
    question: 'Are my investments insured?',
    answer: 'While individual investments are not directly insured, we work with properties that have appropriate insurance coverage. Additionally, we implement strict due diligence processes to minimize investment risks. You can view the specific insurance details for each property in its documentation.',
    category: 'security',
    tags: ['insurance', 'risk', 'protection'],
    helpful: 76
  },
  {
    id: 10,
    question: 'How can I track the performance of my investments?',
    answer: 'You can track your investment performance through your Investor Dashboard and Portfolio page. These sections provide real-time updates on property values, returns, and projected earnings. We also send quarterly performance reports to your registered email address.',
    category: 'returns',
    tags: ['tracking', 'performance', 'portfolio'],
    helpful: 103
  },
  {
    id: 11,
    question: 'What types of properties can I invest in?',
    answer: 'iREVA offers a variety of property types for investment, including residential apartments, commercial buildings, industrial facilities, mixed-use developments, and land. Each property type has different risk profiles and expected returns.',
    category: 'investments',
    tags: ['property types', 'options', 'categories'],
    helpful: 87
  },
  {
    id: 12,
    question: 'How does iREVA select properties for the platform?',
    answer: 'Our team of real estate experts conducts thorough due diligence on all properties before they are listed on the platform. This includes legal verification, financial analysis, physical inspection, and developer background checks. Only properties that meet our strict criteria are made available for investment.',
    category: 'investments',
    tags: ['due diligence', 'selection process', 'quality'],
    helpful: 68
  },
  {
    id: 13,
    question: 'Can I invest if I live outside Nigeria?',
    answer: 'Yes, iREVA welcomes investors from around the world. However, international investors may need to complete additional verification steps and should be aware of the currency exchange implications. We recommend consulting with a tax professional in your country about potential tax obligations.',
    category: 'getting_started',
    tags: ['international', 'foreign investor', 'global'],
    helpful: 91
  },
  {
    id: 14,
    question: 'Is there a limit to how much I can invest?',
    answer: 'There is no upper limit to how much you can invest, but each property has its own minimum investment requirement. Depending on your accreditation level, you may gain access to premium investment opportunities with different minimum thresholds.',
    category: 'investments',
    tags: ['limits', 'maximum', 'investment cap'],
    helpful: 52
  },
  {
    id: 15,
    question: 'How do I get accredited investor status?',
    answer: 'To achieve accredited investor status, you need to meet certain financial criteria and submit supporting documentation. Navigate to the Accreditation section in your profile settings to start the process. Our team will review your submission and update your status accordingly.',
    category: 'account',
    tags: ['accreditation', 'status', 'premium'],
    helpful: 79
  },
];

const FAQsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [helpfulMarked, setHelpfulMarked] = useState<Set<number>>(new Set());

  // Filter FAQs based on search term and category
  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Mark a FAQ as helpful
  const markAsHelpful = (faqId: number) => {
    if (!helpfulMarked.has(faqId)) {
      setHelpfulMarked(new Set(helpfulMarked).add(faqId));
    }
  };

  return (
    <>
      <Helmet>
        <title>FAQs | iREVA</title>
      </Helmet>
      
      <div className="container mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mt-1">
            Find answers to common questions about real estate investments and using iREVA
          </p>
        </div>
        
        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10 py-6"
            placeholder="Search for answers... e.g. 'minimum investment', 'returns', 'security'"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Categories */}
        <Card className="border-none shadow-none">
          <CardContent className="p-0">
            <Tabs 
              defaultValue="all" 
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="getting_started">Getting Started</TabsTrigger>
                <TabsTrigger value="investments">Investments</TabsTrigger>
                <TabsTrigger value="returns">Returns</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {filteredFAQs.length === 0 ? (
            <p>No questions found matching your criteria. Try a different search term or category.</p>
          ) : (
            <p>Showing {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'}</p>
          )}
        </div>
        
        {/* FAQ accordion */}
        {filteredFAQs.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-start">
                        <HelpCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-primary" />
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="ml-7 space-y-4">
                        <p className="text-muted-foreground">{faq.answer}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {faq.tags.map((tag, index) => (
                            <Button 
                              key={index} 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs"
                              onClick={() => setSearchTerm(tag)}
                            >
                              #{tag}
                            </Button>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs flex items-center gap-1"
                              onClick={() => markAsHelpful(faq.id)}
                              disabled={helpfulMarked.has(faq.id)}
                            >
                              <Star className="h-3.5 w-3.5" />
                              {helpfulMarked.has(faq.id) ? 'Marked as helpful' : 'Mark as helpful'}
                            </Button>
                            <span className="text-xs text-muted-foreground flex items-center">
                              {helpfulMarked.has(faq.id) ? faq.helpful + 1 : faq.helpful} people found this helpful
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs">
                            <Bookmark className="h-3.5 w-3.5 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
        
        {/* Still need help */}
        <Card className="border border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Still have questions?
            </CardTitle>
            <CardDescription>
              Can't find the answer you're looking for? Our support team is ready to help.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Browse documentation
            </Button>
            <Button variant="outline">
              Contact support
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FAQsPage;
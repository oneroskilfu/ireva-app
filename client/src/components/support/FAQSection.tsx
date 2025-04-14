import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2 } from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const FAQSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Query to fetch FAQs
  const { data: faqs, isLoading } = useQuery<FAQ[]>({
    queryKey: ['/api/support/faqs', activeCategory !== 'all' ? activeCategory : null],
    queryFn: async ({ queryKey }) => {
      const category = queryKey[1];
      const url = category 
        ? `/api/support/faqs?category=${category}` 
        : '/api/support/faqs';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch FAQs');
      }
      
      return response.json();
    }
  });

  // Category tabs
  const categories = [
    { value: "all", label: "All FAQs" },
    { value: "account", label: "Account" },
    { value: "investment", label: "Investments" },
    { value: "property", label: "Properties" },
    { value: "payment", label: "Payments" },
    { value: "kyc", label: "KYC" },
    { value: "technical", label: "Technical" }
  ];

  // Filter FAQs by search query
  const filteredFaqs = faqs?.filter(faq => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  });

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <CardDescription>Find answers to common questions about our platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for answers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category tabs */}
        <Tabs 
          value={activeCategory} 
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.value} 
                value={category.value}
                className="text-xs md:text-sm whitespace-nowrap"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.value} value={category.value} className="space-y-4">
              {/* Show no results state if needed */}
              {(!filteredFaqs || filteredFaqs.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No FAQ items matching your search</p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}

              {/* FAQ Accordions */}
              {filteredFaqs && filteredFaqs.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-wrap">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="flex-col text-center text-sm text-muted-foreground">
        <p>Can't find what you're looking for?</p>
        <Button 
          variant="link" 
          onClick={() => document.querySelector('[value="new"]')?.dispatchEvent(new Event('click'))}
        >
          Create a support ticket instead
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FAQSection;
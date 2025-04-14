import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

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
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Query to fetch FAQs
  const { data: faqs, isLoading } = useQuery<FAQ[]>({
    queryKey: ['/api/support/faqs'],
    queryFn: async () => {
      const response = await fetch('/api/support/faqs');
      if (!response.ok) {
        throw new Error('Failed to fetch FAQs');
      }
      return response.json();
    }
  });

  // Get unique categories from FAQs
  const categories = faqs 
    ? [...new Set(faqs.map(faq => faq.category))]
    : [];

  // Filter FAQs based on active category and search query
  const filteredFAQs = faqs?.filter(faq => {
    // Filter by category
    const categoryMatch = activeCategory === "all" || faq.category === activeCategory;
    
    // Filter by search query
    const searchMatch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  // Group FAQs by category
  const faqsByCategory = filteredFAQs?.reduce<Record<string, FAQ[]>>((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  // Handle search
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Nothing needed here since we're already filtering based on searchQuery state
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Browse common questions and answers about REVA</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full max-w-md mx-auto mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <CardDescription>Browse common questions and answers about REVA</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <form onSubmit={handleSearch} className="flex w-full max-w-md mx-auto mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search FAQs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="ml-2">Search</Button>
        </form>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full mb-6">
            <TabsList className="w-full max-w-xl mx-auto flex flex-wrap h-auto py-2 justify-center">
              <TabsTrigger value="all" className="m-1">All</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="m-1 capitalize">
                  {category.replace("-", " ")}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* FAQs */}
        {filteredFAQs && filteredFAQs.length > 0 ? (
          <div className="space-y-6">
            {activeCategory === "all" ? (
              // Show FAQs grouped by category
              Object.entries(faqsByCategory || {}).map(([category, categoryFaqs]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-medium mb-4 capitalize">
                    {category.replace("-", " ")}
                  </h3>
                  <Accordion type="single" collapsible className="w-full">
                    {categoryFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))
            ) : (
              // Show FAQs for selected category
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-12 border rounded-md bg-gray-50">
            <p className="text-muted-foreground mb-2">
              {searchQuery
                ? `No FAQs matching "${searchQuery}" found in the ${activeCategory === "all" ? "database" : activeCategory} category.`
                : `No FAQs found in the ${activeCategory} category.`}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Still need help */}
        <div className="mt-8 p-4 border rounded-md bg-muted/30">
          <h3 className="text-lg font-medium mb-2">Still need help?</h3>
          <p className="text-muted-foreground mb-4">
            If you couldn't find the answer to your question, please create a support ticket and our team will assist you.
          </p>
          <Button onClick={() => document.querySelector('[value="new"]')?.dispatchEvent(new Event('click'))}>
            Create Support Ticket
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FAQSection;
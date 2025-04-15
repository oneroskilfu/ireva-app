import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Bookmark, FileQuestion, AlertCircle } from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

const FAQSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState<Set<string>>(new Set(["all"]));
  
  // Fetch FAQs
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
  
  // Extract unique categories
  useEffect(() => {
    if (faqs && faqs.length > 0) {
      const categorySet = new Set(["all"]);
      faqs.forEach(faq => categorySet.add(faq.category));
      setCategories(categorySet);
    }
  }, [faqs]);
  
  // Filter FAQs by search query and category
  const filteredFaqs = faqs?.filter(faq => {
    const searchMatch = 
      searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const categoryMatch = 
      activeCategory === "all" || 
      faq.category === activeCategory;
    
    return searchMatch && categoryMatch;
  });

  // Group FAQs by category
  const faqsByCategory = filteredFaqs?.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <CardDescription>Find answers to common questions about the iREVA platform</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search input */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search FAQs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Category filter tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
          <TabsList className="flex flex-wrap h-auto p-1 mb-4">
            {Array.from(categories).map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* FAQs by category */}
          {isLoading ? (
            // Loading state
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ) : filteredFaqs && filteredFaqs.length > 0 ? (
            // Display FAQs
            <div className="space-y-8">
              {activeCategory === "all" ? (
                // Show all categories grouped
                Object.entries(faqsByCategory || {}).map(([category, categoryFaqs]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-medium capitalize flex items-center">
                      <FileQuestion className="h-5 w-5 mr-2 text-primary" />
                      {category}
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      {categoryFaqs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id.toString()}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-start">
                              <span className="flex-1">{faq.question}</span>
                              {faq.isPopular && (
                                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                                  Popular
                                </Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-2">
                              <p className="text-muted-foreground whitespace-pre-line">{faq.answer}</p>
                              <div className="flex justify-end mt-4">
                                <Button variant="ghost" size="sm" className="text-xs">
                                  <Bookmark className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))
              ) : (
                // Show only selected category
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id.toString()}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start">
                          <span className="flex-1">{faq.question}</span>
                          {faq.isPopular && (
                            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2">
                          <p className="text-muted-foreground whitespace-pre-line">{faq.answer}</p>
                          <div className="flex justify-end mt-4">
                            <Button variant="ghost" size="sm" className="text-xs">
                              <Bookmark className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          ) : (
            // No FAQs found
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No FAQs Found</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {searchQuery 
                  ? `No FAQs matching "${searchQuery}" were found. Try a different search term or browse by category.` 
                  : "There are no FAQs in this category yet. Please check another category or contact support."}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
              >
                View All FAQs
              </Button>
            </div>
          )}
        </Tabs>
        
        {/* Need more help */}
        <div className="mt-8 bg-muted/30 rounded-lg p-4 border">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="flex-1">
              <h3 className="font-medium mb-1">Need more help?</h3>
              <p className="text-muted-foreground text-sm">
                If you can't find the answer to your question, you can create a support ticket for personalized assistance.
              </p>
            </div>
            <Button 
              onClick={() => document.querySelector('[value="new"]')?.dispatchEvent(new Event('click'))}
              className="mt-4 sm:mt-0 w-full sm:w-auto"
            >
              Create Support Ticket
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FAQSection;
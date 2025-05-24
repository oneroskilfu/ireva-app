import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from 'react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: number | null;
  updatedBy: number | null;
}

const FAQAccordion = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Fetch FAQs data
  const { data: faqs, isLoading, isError } = useQuery({
    queryKey: ['/api/faqs'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/faqs');
      return await res.json();
    },
  });

  // Get unique categories from FAQ data
  const categories = React.useMemo(() => {
    if (!faqs) return [];
    const categorySet = new Set(['all', ...faqs.map((faq: FAQ) => faq.category)]);
    return Array.from(categorySet);
  }, [faqs]);

  // Filter FAQs based on search query and active category
  const filteredFaqs = React.useMemo(() => {
    if (!faqs) return [];

    return faqs.filter((faq: FAQ) => {
      const matchesSearch = searchQuery === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchQuery, activeCategory]);

  // Group FAQs by category for tab view
  const faqsByCategory = React.useMemo(() => {
    if (!filteredFaqs.length) return {};

    return filteredFaqs.reduce((acc: Record<string, FAQ[]>, faq: FAQ) => {
      const category = faq.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    }, {});
  }, [filteredFaqs]);

  // Render loading skeletons
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions about property investment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading FAQs</CardTitle>
          <CardDescription>
            Sorry, we couldn't load the FAQ content. Please try again later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
        <CardDescription>
          Find answers to common questions about property investment with iREVA
        </CardDescription>
        <div className="mt-4 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for answers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {categories.length > 2 ? (
          <Tabs defaultValue="all" className="w-full" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-4 flex flex-wrap h-auto">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="capitalize"
                >
                  {category === 'all' ? 'All Categories' : category.replace('_', ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {activeCategory === 'all' ? (
              // All categories view
              <ScrollArea className="max-h-[600px] pr-4">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq: FAQ) => (
                      <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-start">
                            <span className="text-primary font-medium">{faq.question}</span>
                            {searchQuery && (
                              <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded ml-2">
                                {faq.category}
                              </div>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                        </AccordionContent>
                      </AccordionItem>
                    ))
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      No FAQs found matching your search criteria.
                    </p>
                  )}
                </Accordion>
              </ScrollArea>
            ) : (
              // Category-specific view
              <TabsContent value={activeCategory} className="mt-0">
                <ScrollArea className="max-h-[600px] pr-4">
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.length > 0 ? (
                      filteredFaqs.map((faq: FAQ) => (
                        <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">
                        No FAQs found in this category matching your search.
                      </p>
                    )}
                  </Accordion>
                </ScrollArea>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          // Simple view without category tabs
          <ScrollArea className="max-h-[600px] pr-4">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq: FAQ) => (
                  <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No FAQs found matching your search criteria.
                </p>
              )}
            </Accordion>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default FAQAccordion;
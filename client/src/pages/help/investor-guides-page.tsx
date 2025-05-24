import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book, FileText, Users, TrendingUp, Shield, Compass, BarChart4, Landmark, Target, ArrowRight } from 'lucide-react';

export default function InvestorGuidesPage() {
  const guides = [
    {
      id: 1,
      title: "Beginner's Guide to Real Estate Investment",
      description: "Learn the fundamentals of real estate investing and how to get started with minimal capital through the iREVA platform.",
      category: "Beginner",
      icon: <Book className="h-10 w-10 text-primary" />,
      readTime: "15 min read",
      popular: true
    },
    {
      id: 2,
      title: "Understanding Property Returns and ROI",
      description: "A comprehensive guide to calculating and understanding returns on real estate investments, including rental yields and capital appreciation.",
      category: "Intermediate",
      icon: <TrendingUp className="h-10 w-10 text-primary" />,
      readTime: "12 min read",
      popular: false
    },
    {
      id: 3,
      title: "KYC and Verification Process Explained",
      description: "A step-by-step walkthrough of the iREVA verification process, including KYC requirements and accreditation levels.",
      category: "Beginner",
      icon: <Shield className="h-10 w-10 text-primary" />,
      readTime: "8 min read",
      popular: true
    },
    {
      id: 4,
      title: "Building a Diversified Real Estate Portfolio",
      description: "Strategies for creating a balanced and resilient property investment portfolio across different property types and locations.",
      category: "Advanced",
      icon: <BarChart4 className="h-10 w-10 text-primary" />,
      readTime: "20 min read",
      popular: false
    },
    {
      id: 5,
      title: "Tax Benefits of Real Estate Investing in Nigeria",
      description: "Understanding the tax advantages and implications of real estate investments under Nigerian tax laws.",
      category: "Intermediate",
      icon: <Landmark className="h-10 w-10 text-primary" />,
      readTime: "10 min read",
      popular: false
    },
    {
      id: 6,
      title: "Guide to Investment Tiers and Benefits",
      description: "Explore the different investment tiers on iREVA and the unique benefits each offers to investors.",
      category: "Beginner",
      icon: <Target className="h-10 w-10 text-primary" />,
      readTime: "7 min read",
      popular: true
    },
    {
      id: 7,
      title: "Understanding Property Documentation",
      description: "Learn about the essential property documents and legal aspects of real estate investments in Nigeria.",
      category: "Intermediate",
      icon: <FileText className="h-10 w-10 text-primary" />,
      readTime: "14 min read",
      popular: false
    },
    {
      id: 8,
      title: "Analyzing Property Markets in Nigeria",
      description: "A guide to researching and analyzing different property markets across Nigerian cities and regions.",
      category: "Advanced",
      icon: <Compass className="h-10 w-10 text-primary" />,
      readTime: "18 min read",
      popular: false
    },
    {
      id: 9,
      title: "Community Investing and Group Funds",
      description: "How to participate in group investments and leverage the power of community investing on iREVA.",
      category: "Intermediate",
      icon: <Users className="h-10 w-10 text-primary" />,
      readTime: "11 min read",
      popular: true
    }
  ];

  const categories = ["All", "Beginner", "Intermediate", "Advanced"];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Investor Guides</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive resources to help you navigate the world of real estate investing in Nigeria.
              </p>
            </div>
          </div>
        </section>

        {/* Filter section */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button 
                    key={category} 
                    variant={category === "All" ? "default" : "outline"}
                    className="rounded-full"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                <select className="text-sm border rounded-md p-1.5">
                  <option>Most Recent</option>
                  <option>Most Popular</option>
                  <option>Reading Time</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Guides Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((guide) => (
                <Card key={guide.id} className="transition-all duration-300 hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      {guide.icon}
                      <Badge variant={guide.category === "Beginner" ? "default" : guide.category === "Intermediate" ? "secondary" : "outline"}>
                        {guide.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold leading-tight">{guide.title}</CardTitle>
                    <CardDescription className="text-gray-500 text-sm">{guide.readTime}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{guide.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <Button variant="ghost" className="text-primary px-0 hover:bg-transparent hover:text-primary/80">
                      Read Guide <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    {guide.popular && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                        Popular
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Need Personalized Investment Advice?</h2>
              <p className="max-w-2xl mx-auto mb-8">
                Our team of real estate investment experts is available to provide personalized guidance tailored to your investment goals.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/help/contact" className="inline-block bg-white text-primary px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                  Schedule a Consultation
                </a>
                <a href="/auth" className="inline-block bg-transparent text-white border border-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-colors">
                  Create an Account
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
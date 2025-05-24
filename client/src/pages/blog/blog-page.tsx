import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays, Clock, ArrowRight, Search } from 'lucide-react';

export default function BlogPage() {
  const featuredPost = {
    id: 1,
    title: "The Future of Real Estate Investment in Nigeria's Growing Cities",
    excerpt: "As Nigeria's urban centers continue to expand, new investment opportunities are emerging in previously overlooked areas. This analysis explores the most promising locations for real estate investment in 2025 and beyond.",
    date: "April 14, 2025",
    readTime: "8 min read",
    author: {
      name: "Frank Ilo",
      role: "Founder & CEO",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank&skinColor=black&backgroundColor=b6e3f4"
    },
    image: "https://images.unsplash.com/photo-1517462964-21fdcec3f7f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "Market Analysis"
  };

  const posts = [
    {
      id: 2,
      title: "How Fractional Real Estate is Democratizing Property Investment",
      excerpt: "Discover how platforms like iREVA are making it possible for everyday Nigerians to invest in prime real estate with as little as ₦100,000.",
      date: "April 10, 2025",
      readTime: "6 min read",
      author: {
        name: "Kelechi Iloh",
        role: "Chief Technology Officer",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kelechi&skinColor=black&backgroundColor=d1d4f9"
      },
      image: "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      category: "Investment Trends"
    },
    {
      id: 3,
      title: "Understanding the Rental Market in Lagos: 2025 Edition",
      excerpt: "An in-depth look at the current state of the rental market in Lagos, with insights into rental yields, tenant preferences, and emerging neighborhoods.",
      date: "April 5, 2025",
      readTime: "10 min read",
      author: {
        name: "Sarah Johnson",
        role: "Market Analyst",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffdfbf"
      },
      image: "https://images.unsplash.com/photo-1623345805315-2b5854888952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      category: "Market Analysis"
    },
    {
      id: 4,
      title: "5 Key Factors to Consider Before Making Your First Real Estate Investment",
      excerpt: "Expert advice on the critical elements new investors should evaluate before committing to a property investment, from location assessment to financial projections.",
      date: "March 28, 2025",
      readTime: "7 min read",
      author: {
        name: "David Olatunji",
        role: "Investment Advisor",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&skinColor=black&backgroundColor=caffbf"
      },
      image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      category: "Investment Tips"
    },
    {
      id: 5,
      title: "How Technology is Transforming Real Estate Investment in Africa",
      excerpt: "From blockchain-based property registries to AI-powered market analysis, discover the technologies reshaping the African real estate landscape.",
      date: "March 22, 2025",
      readTime: "9 min read",
      author: {
        name: "Kelechi Iloh",
        role: "Chief Technology Officer",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kelechi&skinColor=black&backgroundColor=d1d4f9"
      },
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      category: "Technology"
    },
    {
      id: 6,
      title: "The Impact of Infrastructure Projects on Property Values in Nigeria",
      excerpt: "Analysis of how major infrastructure developments like the Lagos-Calabar railway and the Lekki Deep Sea Port are affecting property investments.",
      date: "March 15, 2025",
      readTime: "8 min read",
      author: {
        name: "Ngozi Adeyemi",
        role: "Urban Development Specialist",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ngozi&backgroundColor=bde0fe"
      },
      image: "https://images.unsplash.com/photo-1590171725125-ab2024681b29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      category: "Market Analysis"
    }
  ];

  const categories = ["All", "Market Analysis", "Investment Tips", "Technology", "Investment Trends", "Success Stories"];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">iREVA Blog</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Insights, analysis, and expert perspectives on real estate investment in Nigeria and beyond.
              </p>
              <div className="mt-8 max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    placeholder="Search articles..." 
                    className="pl-10 rounded-full pr-4 h-12" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Article */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="text-2xl font-bold mb-8">Featured Article</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-1/2">
                  <img 
                    className="h-64 w-full object-cover md:h-full" 
                    src={featuredPost.image} 
                    alt={featuredPost.title} 
                  />
                </div>
                <div className="p-8 md:w-1/2">
                  <Badge className="mb-4">{featuredPost.category}</Badge>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {featuredPost.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center mb-6">
                    <img 
                      className="h-10 w-10 rounded-full mr-4" 
                      src={featuredPost.author.image} 
                      alt={featuredPost.author.name} 
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{featuredPost.author.name}</p>
                      <p className="text-sm text-gray-500">{featuredPost.author.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <CalendarDays className="mr-1 h-4 w-4" />
                        {featuredPost.date}
                      </span>
                      <span className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <Button>
                      Read Article
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
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
          </div>
        </section>

        {/* Blog posts grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge>{post.category}</Badge>
                      <div className="flex text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mt-2 line-clamp-2">{post.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center pt-0">
                    <div className="flex items-center">
                      <img 
                        className="h-8 w-8 rounded-full mr-2" 
                        src={post.author.image} 
                        alt={post.author.name} 
                      />
                      <div>
                        <p className="text-xs font-medium text-gray-900">{post.author.name}</p>
                        <p className="text-xs text-gray-500">{post.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-primary px-0 hover:bg-transparent hover:text-primary/80">
                      Read <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button className="rounded-full px-8">
                Load More Articles
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
              <p className="max-w-2xl mx-auto mb-8">
                Subscribe to our newsletter for the latest insights on real estate investment opportunities, market trends, and expert advice.
              </p>
              <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                <Input 
                  placeholder="Enter your email address" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Button className="bg-white text-primary hover:bg-white/90">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
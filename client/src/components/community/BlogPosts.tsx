import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Video, Calendar, User, Clock, BookmarkPlus } from "lucide-react";

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: "How Crowdfunding is Transforming Real Estate Investment",
    excerpt: "Learn how technology is democratizing access to real estate investment opportunities for everyday investors.",
    category: "education",
    type: "article",
    author: "Sarah Chen",
    date: "2025-03-15",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=873&q=80"
  },
  {
    id: 2,
    title: "Real Estate Market Trends to Watch in 2025",
    excerpt: "Discover the hottest real estate markets and investment strategies to watch in the coming year.",
    category: "market",
    type: "article",
    author: "Michael Rodriguez",
    date: "2025-04-02",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1592595896616-c37162298647?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
  },
  {
    id: 3,
    title: "Beginner's Guide to Real Estate Investment",
    excerpt: "Everything you need to know to get started with real estate investing - from terminology to strategy.",
    category: "education",
    type: "video",
    author: "Jennifer Park",
    date: "2025-02-27",
    readTime: "15 min watch",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
  },
  {
    id: 4,
    title: "Tax Benefits of Real Estate Investing",
    excerpt: "Learn about the various tax advantages available to real estate investors and how to maximize your returns.",
    category: "finance",
    type: "article",
    author: "David Washington",
    date: "2025-03-21",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
  },
  {
    id: 5,
    title: "Success Story: From First Property to Portfolio",
    excerpt: "Watch how one investor built a diverse real estate portfolio starting with a single property investment.",
    category: "success",
    type: "video",
    author: "Amanda Lee",
    date: "2025-03-05",
    readTime: "18 min watch",
    image: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
  },
  {
    id: 6,
    title: "Understanding Cap Rates and ROI Metrics",
    excerpt: "A deep dive into the financial metrics that matter when evaluating real estate investments.",
    category: "finance",
    type: "article",
    author: "Robert Kim",
    date: "2025-04-10",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1542125387-c71274d94f0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
  }
];

export function BlogPosts() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const filteredPosts = selectedCategory === "all" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Blog & Educational Content</h2>
          <p className="text-gray-500">Stay updated with the latest insights and strategies</p>
        </div>
        
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="education">Educational</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="success">Success Stories</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map(post => (
          <Card key={post.id} className="overflow-hidden flex flex-col h-full">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              />
              <Badge className="absolute top-3 right-3 capitalize">
                {post.type === 'video' ? (
                  <><Video className="h-3 w-3 mr-1" /> Video</>
                ) : (
                  <><BookOpen className="h-3 w-3 mr-1" /> Article</>
                )}
              </Badge>
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <span className="flex items-center mr-3">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <span className="flex items-center mr-3">
                  <User className="h-3 w-3 mr-1" />
                  {post.author}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {post.readTime}
                </span>
              </div>
              <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
              <CardDescription className="line-clamp-3 mt-2">{post.excerpt}</CardDescription>
            </CardHeader>
            
            <CardFooter className="pt-2 mt-auto">
              <div className="flex justify-between items-center w-full">
                <Button variant="link" className="p-0 h-auto text-primary">Read more</Button>
                <Button variant="ghost" size="icon" title="Save for later">
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button variant="outline">Load More Articles</Button>
      </div>
    </div>
  );
}
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building,
  Home,
  Building2,
  BarChart2,
  GraduationCap,
  Users,
  HelpCircle,
  MessageSquare,
  Eye,
  ArrowRight
} from "lucide-react";

type ForumTopicType = "latest" | "trending" | "top";

interface ForumTopicListProps {
  type: ForumTopicType;
  categoryId: string | null;
}

// Sample forum topics data
const topics = [
  {
    id: 1,
    title: "What are your thoughts on crowdfunding vs REITs for passive income?",
    excerpt: "I'm looking to diversify my portfolio with real estate investments but I'm torn between crowdfunding platforms and REITs. What has been your experience with either option in terms of returns, liquidity, and risk?",
    author: {
      name: "Michael Chen",
      avatar: "MC",
      role: "Investor"
    },
    categoryId: "general",
    category: "General Discussion",
    replies: 24,
    views: 342,
    isHot: true,
    isPinned: true,
    lastActivity: "2025-04-14T09:23:00Z",
    tags: ["investing", "passive-income", "comparison"]
  },
  {
    id: 2,
    title: "Lagos Real Estate Market Analysis 2025",
    excerpt: "I've compiled a comprehensive analysis of the Lagos real estate market trends for 2025. The report covers price trends, neighborhood appreciation rates, and investment opportunities across different areas.",
    author: {
      name: "Ade Johnson",
      avatar: "AJ",
      role: "Market Analyst"
    },
    categoryId: "market-insights",
    category: "Market Insights",
    replies: 18,
    views: 276,
    isHot: true,
    isPinned: false,
    lastActivity: "2025-04-13T14:52:00Z",
    tags: ["lagos", "market-analysis", "trends"]
  },
  {
    id: 3,
    title: "How do you conduct due diligence on residential property investments?",
    excerpt: "I'm about to make my first residential property investment through this platform. What key factors should I be examining in the investment prospectus? Any red flags I should watch out for?",
    author: {
      name: "Sarah Wong",
      avatar: "SW",
      role: "New Investor"
    },
    categoryId: "residential",
    category: "Residential Properties",
    replies: 32,
    views: 412,
    isHot: false,
    isPinned: false,
    lastActivity: "2025-04-12T18:15:00Z",
    tags: ["due-diligence", "beginner", "residential"]
  },
  {
    id: 4,
    title: "Commercial property tax benefits explained",
    excerpt: "I've put together a guide on the tax advantages of commercial property investments, including depreciation, 1031 exchanges, and business expense deductions. Hope this helps fellow investors.",
    author: {
      name: "David Wilson",
      avatar: "DW",
      role: "Tax Specialist"
    },
    categoryId: "commercial",
    category: "Commercial Properties",
    replies: 15,
    views: 187,
    isHot: false,
    isPinned: false,
    lastActivity: "2025-04-10T08:30:00Z",
    tags: ["tax", "commercial", "guide"]
  },
  {
    id: 5,
    title: "Investment performance tracking - Tools & templates?",
    excerpt: "What tools are you using to track the performance of your real estate investments? I'm looking for something that can help me compare ROI across different properties and investment types.",
    author: {
      name: "Jessica Park",
      avatar: "JP",
      role: "Investor"
    },
    categoryId: "education",
    category: "Education & Learning",
    replies: 29,
    views: 315,
    isHot: true,
    isPinned: false,
    lastActivity: "2025-04-09T21:42:00Z",
    tags: ["tools", "roi", "tracking"]
  },
  {
    id: 6,
    title: "Introducing myself - New investor from Abuja",
    excerpt: "Hello everyone! I'm new to the platform and to real estate investing in general. I'm based in Abuja and looking to connect with other local investors to share insights and potentially collaborate.",
    author: {
      name: "Emmanuel Okafor",
      avatar: "EO",
      role: "New Member"
    },
    categoryId: "networking",
    category: "Networking",
    replies: 12,
    views: 98,
    isHot: false,
    isPinned: false,
    lastActivity: "2025-04-08T11:05:00Z",
    tags: ["introduction", "abuja", "networking"]
  },
  {
    id: 7,
    title: "How to update payment information?",
    excerpt: "I recently got a new credit card and need to update my payment information for automatic monthly investments. Can anyone guide me through the process on the platform?",
    author: {
      name: "Robert Lee",
      avatar: "RL",
      role: "Member"
    },
    categoryId: "support",
    category: "Help & Support",
    replies: 5,
    views: 47,
    isHot: false,
    isPinned: false,
    lastActivity: "2025-04-07T15:23:00Z",
    tags: ["payment", "help", "account"]
  }
];

// Map category IDs to icons
const categoryIcons: Record<string, JSX.Element> = {
  "general": <Building className="h-4 w-4" />,
  "residential": <Home className="h-4 w-4" />,
  "commercial": <Building2 className="h-4 w-4" />,
  "market-insights": <BarChart2 className="h-4 w-4" />,
  "education": <GraduationCap className="h-4 w-4" />,
  "networking": <Users className="h-4 w-4" />,
  "support": <HelpCircle className="h-4 w-4" />
};

export function ForumTopicList({ type, categoryId }: ForumTopicListProps) {
  // Sort or filter topics based on type
  const getFilteredTopics = () => {
    let filteredTopics = [...topics];
    
    // Filter by category if selected
    if (categoryId) {
      filteredTopics = filteredTopics.filter(topic => topic.categoryId === categoryId);
    }
    
    // Sort based on type
    if (type === "latest") {
      return filteredTopics.sort((a, b) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
    } else if (type === "trending") {
      return filteredTopics.sort((a, b) => 
        (b.replies * 2 + b.views) - (a.replies * 2 + a.views)
      );
    } else {
      // Top posts (highest reply count)
      return filteredTopics.sort((a, b) => b.replies - a.replies);
    }
  };

  const filteredTopics = getFilteredTopics();
  
  // If loading (for future api implementation)
  const isLoading = false;
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
              <div className="flex justify-between mt-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (filteredTopics.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium">No topics found</h3>
          <p className="text-gray-500 text-center mt-1 mb-4">
            {categoryId 
              ? "There are no topics in this category yet."
              : "No topics match the current filter."
            }
          </p>
          <Button>
            Start a New Conversation
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      if (diffHours < 1) {
        return "Just now";
      }
      return `${Math.floor(diffHours)} hours ago`;
    } else if (diffHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
      });
    }
  };
  
  return (
    <div className="space-y-4">
      {filteredTopics.map(topic => (
        <Card key={topic.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start gap-4 p-4">
            <div className="md:shrink-0 md:w-14 md:h-14 flex md:flex-col items-center justify-center md:justify-start space-x-2 md:space-x-0 md:space-y-1">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src="" alt={topic.author.name} />
                <AvatarFallback>{topic.author.avatar}</AvatarFallback>
              </Avatar>
              <div className="text-xs text-center text-gray-500 md:mt-1 truncate max-w-14">
                {topic.author.role}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h3 className="font-semibold text-lg mr-auto">
                  <a href={`/forum/topic/${topic.id}`} className="hover:text-primary transition-colors truncate block">
                    {topic.title}
                  </a>
                </h3>
                
                {topic.isPinned && (
                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                    Pinned
                  </Badge>
                )}
                
                {topic.isHot && (
                  <Badge variant="outline" className="border-rose-500 text-rose-500">
                    Hot
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="flex items-center">
                  {categoryIcons[topic.categoryId]}
                  <span className="ml-1">{topic.category}</span>
                </span>
                <span>•</span>
                <span>{formatDate(topic.lastActivity)}</span>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {topic.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mt-auto">
                <div className="flex flex-wrap gap-1">
                  {topic.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="ml-auto flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {topic.replies}
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {topic.views}
                  </span>
                  <Button variant="ghost" size="sm" className="hidden md:flex" asChild>
                    <a href={`/forum/topic/${topic.id}`}>
                      Read More
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
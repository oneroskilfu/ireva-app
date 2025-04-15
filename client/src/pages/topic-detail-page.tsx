import { useState } from "react";
import { useParams } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  MessageSquare,
  Heart,
  Share2,
  MoreHorizontal,
  Flag,
  Copy,
  Bookmark,
  Building,
  ThumbsUp,
  Reply,
  Home,
  Building2,
  BarChart2,
  GraduationCap,
  Users,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample topic with replies
const topic = {
  id: 1,
  title: "What are your thoughts on crowdfunding vs REITs for passive income?",
  content: `<p>I'm looking to diversify my portfolio with real estate investments but I'm torn between crowdfunding platforms and REITs. What has been your experience with either option in terms of returns, liquidity, and risk?</p>
  <p>From my research so far:</p>
  <ul>
    <li>REITs seem to offer better liquidity as they can be traded on stock exchanges</li>
    <li>Crowdfunding platforms like this one give more direct access to specific properties</li>
    <li>The minimum investment amount seems lower on crowdfunding platforms</li>
  </ul>
  <p>I'd really appreciate hearing about your personal experiences with either option, especially regarding dividend consistency and capital appreciation.</p>`,
  author: {
    id: 101,
    name: "Michael Chen",
    avatar: "MC",
    role: "Investor",
    joinDate: "2024-10-15T00:00:00Z",
    postCount: 28
  },
  categoryId: "general",
  category: "General Discussion",
  replies: 24,
  views: 342,
  isHot: true,
  isPinned: true,
  lastActivity: "2025-04-14T09:23:00Z",
  createdAt: "2025-04-12T15:30:00Z",
  tags: ["investing", "passive-income", "comparison"],
  totalLikes: 18,
  liked: false,
  bookmarked: false
};

// Sample replies
const replies = [
  {
    id: 101,
    content: `<p>Great question! I've invested in both REITs and real estate crowdfunding over the past few years, and here's my take:</p>
    <p><strong>REITs:</strong></p>
    <ul>
      <li>Pros: Highly liquid, professionally managed, diversified exposure, typically pays regular dividends</li>
      <li>Cons: Share prices can be volatile and influenced by stock market sentiment rather than just property values</li>
    </ul>
    <p><strong>Crowdfunding:</strong></p>
    <ul>
      <li>Pros: Direct property selection, potentially higher returns, more transparent about specific investments</li>
      <li>Cons: Illiquid until property sale/exit, platform risk, fewer regulations</li>
    </ul>
    <p>Personally, I keep about 70% of my real estate allocation in REITs for liquidity and 30% in crowdfunding for the higher return potential. It's all about your own risk tolerance and time horizon.</p>`,
    author: {
      id: 102,
      name: "Sarah Williams",
      avatar: "SW",
      role: "Veteran Investor",
      joinDate: "2023-05-22T00:00:00Z",
      postCount: 143
    },
    createdAt: "2025-04-13T08:45:00Z",
    totalLikes: 12,
    liked: true,
    isAcceptedAnswer: false
  },
  {
    id: 102,
    content: `<p>I've been investing in REITs for over a decade and just started with crowdfunding platforms about two years ago. Here's my experience with the income aspect:</p>
    <p>My REIT portfolio has consistently delivered 4-6% annual dividend yield, which is nice for steady income. The crowdfunding investments I've made have projected returns of 8-14%, but they're structured differently - some pay quarterly distributions while others are more focused on appreciation at exit.</p>
    <p>One thing to consider is tax treatment. REIT dividends are typically taxed as ordinary income, while crowdfunding investments might offer some depreciation benefits depending on how they're structured.</p>
    <p>I'd recommend starting with a small allocation to each and seeing which approach fits your investment style and goals.</p>`,
    author: {
      id: 103,
      name: "Robert Kim",
      avatar: "RK",
      role: "Financial Advisor",
      joinDate: "2024-02-10T00:00:00Z",
      postCount: 87
    },
    createdAt: "2025-04-13T14:22:00Z",
    totalLikes: 8,
    liked: false,
    isAcceptedAnswer: true
  },
  {
    id: 103,
    content: `<p>I've had a very different experience than most here. I invested in a few real estate crowdfunding projects in 2023 that severely underperformed. One project even had significant delays and ended up returning only about 60% of my initial capital after 18 months.</p>
    <p>Since then, I've shifted entirely to REITs and index funds. The transparency and liquidity are worth the potentially lower returns to me. If you do go the crowdfunding route, I'd suggest:</p>
    <ul>
      <li>Only invest money you won't need for the full investment term</li>
      <li>Diversify across multiple projects and platforms</li>
      <li>Look closely at the platform's track record and how they've handled past underperforming projects</li>
    </ul>
    <p>Everyone's risk tolerance is different, but I learned my lesson the hard way.</p>`,
    author: {
      id: 104,
      name: "David Johnson",
      avatar: "DJ",
      role: "Investor",
      joinDate: "2024-08-18T00:00:00Z",
      postCount: 35
    },
    createdAt: "2025-04-14T09:05:00Z",
    totalLikes: 5,
    liked: false,
    isAcceptedAnswer: false
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

export default function TopicDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const [replyContent, setReplyContent] = useState("");
  const [topicLiked, setTopicLiked] = useState(topic.liked);
  const [topicBookmarked, setTopicBookmarked] = useState(topic.bookmarked);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" className="mb-4" asChild>
              <a href="/forum">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forum
              </a>
            </Button>
            
            <div className="space-y-6">
              {/* Topic header */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl font-bold mr-auto">{topic.title}</h1>
                  
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
                
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center">
                    {categoryIcons[topic.categoryId]}
                    <a href={`/forum?category=${topic.categoryId}`} className="ml-1 hover:text-primary">
                      {topic.category}
                    </a>
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {topic.replies} replies
                  </span>
                  <span className="flex items-center">
                    Posted {formatDate(topic.createdAt)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {topic.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Topic content */}
              <Card>
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 p-4 md:border-r bg-muted/20">
                    <div className="flex flex-row md:flex-col items-center md:items-center gap-3">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src="" alt={topic.author.name} />
                        <AvatarFallback>{topic.author.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 md:text-center">
                        <div className="font-medium">{topic.author.name}</div>
                        <div className="text-sm text-gray-500">{topic.author.role}</div>
                        <div className="text-xs text-gray-500 mt-1 md:mt-3">
                          Member since {new Date(topic.author.joinDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short"
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {topic.author.postCount} posts
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div 
                      className="prose max-w-none mb-4" 
                      dangerouslySetInnerHTML={{ __html: topic.content }}
                    />
                    
                    <div className="flex items-center justify-between border-t pt-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={cn(
                            "flex items-center gap-1",
                            topicLiked && "text-primary"
                          )}
                          onClick={() => setTopicLiked(!topicLiked)}
                        >
                          <Heart className="h-4 w-4" fill={topicLiked ? "currentColor" : "none"} />
                          <span>{topic.totalLikes + (topicLiked && !topic.liked ? 1 : 0)}</span>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={cn(
                            "flex items-center gap-1",
                            topicBookmarked && "text-primary"
                          )}
                          onClick={() => setTopicBookmarked(!topicBookmarked)}
                        >
                          <Bookmark 
                            className="h-4 w-4" 
                            fill={topicBookmarked ? "currentColor" : "none"} 
                          />
                          <span>Bookmark</span>
                        </Button>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center">
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Copy Link</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center text-red-600">
                            <Flag className="mr-2 h-4 w-4" />
                            <span>Report</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Replies */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  {topic.replies} Replies
                </h2>
                
                {replies.map((reply) => (
                  <Card key={reply.id} className={cn(
                    reply.isAcceptedAnswer && "border-green-200"
                  )}>
                    {reply.isAcceptedAnswer && (
                      <div className="bg-green-50 text-green-700 px-4 py-1 text-sm font-medium flex items-center">
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Accepted Answer
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 p-4 md:border-r bg-muted/20">
                        <div className="flex flex-row md:flex-col items-center md:items-center gap-3">
                          <Avatar className="h-12 w-12 border">
                            <AvatarImage src="" alt={reply.author.name} />
                            <AvatarFallback>{reply.author.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 md:text-center">
                            <div className="font-medium">{reply.author.name}</div>
                            <div className="text-sm text-gray-500">{reply.author.role}</div>
                            <div className="text-xs text-gray-500 mt-1 md:mt-3">
                              {reply.author.postCount} posts
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-4">
                        <div className="text-xs text-gray-500 mb-2">
                          Posted {formatDate(reply.createdAt)}
                        </div>
                        
                        <div 
                          className="prose max-w-none mb-4" 
                          dangerouslySetInnerHTML={{ __html: reply.content }}
                        />
                        
                        <div className="flex items-center justify-between border-t pt-4 mt-4">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className={cn(
                                "flex items-center gap-1",
                                reply.liked && "text-primary"
                              )}
                            >
                              <ThumbsUp 
                                className="h-4 w-4" 
                                fill={reply.liked ? "currentColor" : "none"} 
                              />
                              <span>{reply.totalLikes}</span>
                            </Button>
                            
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <Reply className="h-4 w-4" />
                              <span>Reply</span>
                            </Button>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="flex items-center">
                                <Reply className="mr-2 h-4 w-4" />
                                <span>Quote</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center text-red-600">
                                <Flag className="mr-2 h-4 w-4" />
                                <span>Report</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Reply form */}
              {user ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Leave a Reply</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form>
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply here..."
                        className="min-h-[150px]"
                      />
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-gray-500">
                      Markdown formatting supported
                    </div>
                    <Button>Post Reply</Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Sign in to join the discussion</h3>
                      <p className="text-gray-500 mb-4">
                        You need to be logged in to post replies
                      </p>
                      <Button asChild>
                        <a href="/auth">Sign In</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Add missing CheckSquare component reference
function CheckSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
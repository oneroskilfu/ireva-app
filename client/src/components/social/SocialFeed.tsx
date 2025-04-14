import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocialShareButtons } from '@/components/social/SocialShareButtons';
import { Heart, MessageSquare, Repeat, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Property } from '@shared/schema';
import { Link } from 'wouter';

// Types for the social feed
interface SocialPost {
  id: number;
  type: 'investment' | 'milestone' | 'market-update' | 'community';
  content: string;
  timestamp: string;
  user: {
    id: number;
    name: string;
    username: string;
    imageUrl?: string;
  };
  likes: number;
  comments: number;
  liked: boolean;
  property?: Property;
}

export function SocialFeed() {
  const [activeTab, setActiveTab] = useState<string>('trending');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  
  // Fetch posts on component mount and when tab changes
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // In a real implementation, we would fetch posts from the server
        // For demo purposes, we'll use static data
        const demoData: SocialPost[] = [
          {
            id: 1,
            type: 'investment',
            content: 'I just invested in Skyline Apartments! Excited to be part of this amazing property in Lagos.',
            timestamp: '2023-11-20T10:30:00Z',
            user: {
              id: 1,
              name: 'John Doe',
              username: 'johndoe',
              imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
            },
            likes: 24,
            comments: 5,
            liked: false,
            property: {
              id: 1,
              name: 'Skyline Apartments',
              location: 'Lagos, Nigeria',
              description: 'Luxury apartments with stunning views of the city skyline',
              imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=450&q=80',
              targetReturn: 12.5,
              term: 36,
              totalFunding: 250000000,
              currentFunding: 180000000,
              minimumInvestment: 100000,
              type: 'residential',
              numberOfInvestors: 45,
              occupancy: '95%',
              daysLeft: 15
            }
          },
          {
            id: 2,
            type: 'milestone',
            content: 'Just reached my first ₦1,000,000 in real estate investments! Thank you REVA for making this possible.',
            timestamp: '2023-11-19T15:45:00Z',
            user: {
              id: 2,
              name: 'Sarah Johnson',
              username: 'sarahj',
              imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
            },
            likes: 42,
            comments: 12,
            liked: true
          },
          {
            id: 3,
            type: 'market-update',
            content: 'Market Update: Abuja real estate prices have increased by 5.2% this quarter, making it a great time to invest in our Capital Residences property.',
            timestamp: '2023-11-18T09:15:00Z',
            user: {
              id: 3,
              name: 'REVA Insights',
              username: 'revainsights',
              imageUrl: '/logo.svg'
            },
            likes: 18,
            comments: 3,
            liked: false,
            property: {
              id: 2,
              name: 'Capital Residences',
              location: 'Abuja, Nigeria',
              description: 'Modern apartments in the heart of the capital',
              imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=450&q=80',
              targetReturn: 11.2,
              term: 48,
              totalFunding: 180000000,
              currentFunding: 120000000,
              minimumInvestment: 100000,
              type: 'residential',
              numberOfInvestors: 32,
              occupancy: '92%',
              daysLeft: 24
            }
          },
          {
            id: 4,
            type: 'community',
            content: 'Just attended REVA's investor meetup in Lagos. Great insights on real estate trends and networking opportunities!',
            timestamp: '2023-11-17T18:20:00Z',
            user: {
              id: 4,
              name: 'Michael Okonkwo',
              username: 'mikeokons',
              imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
            },
            likes: 35,
            comments: 8,
            liked: false
          }
        ];
        
        // Sort posts based on tab
        let sortedPosts = [...demoData];
        if (activeTab === 'trending') {
          sortedPosts = sortedPosts.sort((a, b) => b.likes - a.likes);
        } else if (activeTab === 'recent') {
          sortedPosts = sortedPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } else if (activeTab === 'investments') {
          sortedPosts = sortedPosts.filter(post => post.type === 'investment');
        } else if (activeTab === 'community') {
          sortedPosts = sortedPosts.filter(post => post.type === 'community' || post.type === 'milestone');
        }
        
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Failed to fetch social posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [activeTab]);
  
  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Handle like post
  const handleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLiked = !post.liked;
        return {
          ...post,
          liked: newLiked,
          likes: newLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };
  
  // Get icon based on post type
  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return <Sparkles className="h-4 w-4 text-primary" />;
      case 'milestone':
        return <Sparkles className="h-4 w-4 text-yellow-500" />;
      case 'market-update':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'community':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No posts available in this category.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={post.user.imageUrl} alt={post.user.name} />
                      <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{post.user.name}</span>
                        <span className="text-xs text-muted-foreground">@{post.user.username}</span>
                        {getPostTypeIcon(post.type) && (
                          <div className="ml-1 flex items-center text-xs text-muted-foreground">
                            {getPostTypeIcon(post.type)}
                            <span className="ml-1">{post.type.charAt(0).toUpperCase() + post.type.slice(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatTimestamp(post.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm mb-4">{post.content}</p>
                
                {post.property && (
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={post.property.imageUrl} 
                        alt={post.property.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-semibold text-sm">{post.property.name}</h4>
                          <p className="text-xs text-muted-foreground">{post.property.location}</p>
                        </div>
                        <div className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                          {post.property.targetReturn}% Return
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {post.property.description}
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 w-full text-xs" asChild>
                        <Link href={`/properties/${post.property.id}`}>View Property</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between py-2 border-t">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`px-2 ${post.liked ? 'text-red-500' : ''}`} 
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    <span className="text-xs">{post.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="px-2">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="text-xs">{post.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="px-2">
                    <Repeat className="h-4 w-4 mr-1" />
                    <span className="text-xs">Share</span>
                  </Button>
                </div>
                
                {post.property && (
                  <SocialShareButtons
                    title={`Check out ${post.property.name} on REVA - ${post.property.targetReturn}% returns!`}
                    description={`${post.property.description} - Invest with as little as ₦100,000.`}
                    url={`${window.location.origin}/properties/${post.property.id}`}
                    compact
                  />
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { 
  Users, 
  Award, 
  Share2, 
  TrendingUp, 
  MessageSquare, 
  PenSquare 
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SocialFeed } from '@/components/social/SocialFeed';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import { usePageTransition } from '@/contexts/page-transition-context';
import { ProtectedRoute } from '@/lib/protected-route';

function SocialCommunityPageContent() {
  const [activeTab, setActiveTab] = useState('feed');
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const { user } = useAuth();
  const { startLoading, stopLoading } = usePageTransition();
  
  const badgesData = [
    { id: 1, name: 'Early Investor', description: 'Joined within the first month of launch', icon: <Award className="h-8 w-8 text-primary" /> },
    { id: 2, name: 'Top Sharer', description: 'Shared properties more than 10 times', icon: <Share2 className="h-8 w-8 text-blue-500" /> },
    { id: 3, name: 'Property Expert', description: 'Invested in 5+ different properties', icon: <TrendingUp className="h-8 w-8 text-green-500" /> },
    { id: 4, name: 'Community Builder', description: 'Made 20+ comments on community posts', icon: <MessageSquare className="h-8 w-8 text-purple-500" /> },
  ];
  
  const referralStats = {
    invitesSent: 12,
    usersJoined: 5,
    rewards: '₦50,000'
  };
  
  const handlePostSubmit = () => {
    if (!postContent.trim()) {
      toast({
        title: "Post cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would post to the server
    toast({
      title: "Post created",
      description: "Your post has been shared with the community"
    });
    
    setPostContent('');
    setPostDialogOpen(false);
  };
  
  const copyReferralLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${user?.id}`);
    toast({
      title: "Referral link copied",
      description: "Share this link with friends to earn rewards"
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Community</h1>
              <p className="text-muted-foreground">Connect with fellow investors and share your REVA journey</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <PenSquare className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Create a Post</DialogTitle>
                    <DialogDescription>
                      Share your thoughts, investment journey, or questions with the community
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Textarea 
                      placeholder="What's on your mind?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handlePostSubmit}>Post</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="feed">Community Feed</TabsTrigger>
                  <TabsTrigger value="achievements">Your Achievements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="feed" className="mt-4">
                  <SocialFeed />
                </TabsContent>
                
                <TabsContent value="achievements" className="mt-4">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Award className="h-5 w-5 mr-2 text-primary" />
                          Your Badges
                        </CardTitle>
                        <CardDescription>
                          Badges you've earned through your investment journey
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {badgesData.map((badge) => (
                            <div key={badge.id} className="p-4 border rounded-md flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                {badge.icon}
                              </div>
                              <div>
                                <h3 className="font-semibold">{badge.name}</h3>
                                <p className="text-sm text-muted-foreground">{badge.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                          Investment Milestones
                        </CardTitle>
                        <CardDescription>
                          Track your investment achievements
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">First Investment</span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Completed
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Invest ₦1,000,000</span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Completed
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Invest in 5 Properties</span>
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                2/5 Completed
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Invest ₦5,000,000</span>
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                Not Started
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Referral Program
                  </CardTitle>
                  <CardDescription>
                    Invite friends and earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm mb-2">
                      Earn ₦10,000 for every friend who signs up and makes their first investment
                    </p>
                    <div className="flex flex-col gap-3 mt-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Your referral link</span>
                        <div className="flex">
                          <Input
                            readOnly
                            value={`${window.location.origin.substring(0, 25)}...?ref=${user?.id}`}
                            className="rounded-r-none"
                          />
                          <Button 
                            variant="outline" 
                            onClick={copyReferralLink}
                            className="rounded-l-none"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-2">Your Referral Stats</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-primary/5 p-3 rounded-md text-center">
                        <span className="block text-xl font-semibold">{referralStats.invitesSent}</span>
                        <span className="text-xs text-muted-foreground">Invites Sent</span>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-md text-center">
                        <span className="block text-xl font-semibold">{referralStats.usersJoined}</span>
                        <span className="text-xs text-muted-foreground">Joined</span>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-md text-center">
                        <span className="block text-xl font-semibold">{referralStats.rewards}</span>
                        <span className="text-xs text-muted-foreground">Earned</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>
                    Connect with the REVA community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold">Investor Meetup: Lagos</h3>
                        <Badge variant="outline">Dec 15</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Network with fellow investors and learn about new property opportunities
                      </p>
                      <Button variant="outline" size="sm">RSVP</Button>
                    </div>
                    <div className="border-b pb-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold">Webinar: Real Estate Trends</h3>
                        <Badge variant="outline">Dec 22</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Online session discussing emerging trends in Nigerian real estate
                      </p>
                      <Button variant="outline" size="sm">Register</Button>
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold">Property Tour: Abuja</h3>
                        <Badge variant="outline">Jan 5</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Exclusive tour of our newest properties in Abuja
                      </p>
                      <Button variant="outline" size="sm">Join Waitlist</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SocialCommunityPage() {
  return (
    <ProtectedRoute path="/community" component={SocialCommunityPageContent} />
  );
}
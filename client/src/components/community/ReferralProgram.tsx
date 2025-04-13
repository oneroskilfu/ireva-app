import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CopyIcon,
  Share,
  Facebook,
  Twitter,
  Mail,
  Gift,
  Users,
  DollarSign,
  Award
} from "lucide-react";

// Sample referral data
const referralHistory = [
  { id: 1, name: "Michael Brown", status: "Signed Up", date: "2025-04-01", reward: null },
  { id: 2, name: "Sarah Johnson", status: "Invested", date: "2025-03-28", reward: "$50" },
  { id: 3, name: "Robert Chen", status: "Invested", date: "2025-03-15", reward: "$50" },
  { id: 4, name: "Emma Wilson", status: "Signed Up", date: "2025-03-10", reward: null },
];

export function ReferralProgram() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [emailList, setEmailList] = useState("");
  const [activeTab, setActiveTab] = useState("link");
  
  // Simulated referral code
  const referralCode = user?.id ? `${user.username}-${user.id}` : "user-referral-code";
  const referralLink = `https://realestate-crowdfunding.com/join?ref=${referralCode}`;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard!",
          description: "Share it with your friends to earn rewards.",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually.",
          variant: "destructive",
        });
      });
  };
  
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Invitation sent!",
      description: `Your invitation has been sent to ${email}`,
    });
    setEmail("");
  };
  
  const handleBulkInvite = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Invitations sent!",
      description: "Your invitations have been sent to all the email addresses.",
    });
    setEmailList("");
  };
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Refer Friends, Earn Rewards</CardTitle>
            <CardDescription>
              Share your referral link with friends and earn $50 for each friend who makes their first investment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="link">Referral Link</TabsTrigger>
                <TabsTrigger value="email">Email Invite</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Invite</TabsTrigger>
              </TabsList>
              
              <TabsContent value="link" className="mt-4 space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium">Your Referral Link</label>
                  <div className="flex w-full max-w-md">
                    <Input
                      value={referralLink}
                      readOnly
                      className="rounded-r-none"
                    />
                    <Button
                      variant="secondary"
                      className="rounded-l-none"
                      onClick={() => copyToClipboard(referralLink)}
                    >
                      <CopyIcon className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="text-sm font-medium mb-2">Share via</div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4 mr-2" />
                      More
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="email" className="mt-4">
                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Friend's Email</label>
                    <Input
                      type="email"
                      placeholder="Enter your friend's email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit">Send Invitation</Button>
                </form>
              </TabsContent>
              
              <TabsContent value="bulk" className="mt-4">
                <form onSubmit={handleBulkInvite} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Multiple Emails (one per line)</label>
                    <textarea
                      className="w-full min-h-[100px] p-2 border rounded-md"
                      placeholder="Enter email addresses (one per line)"
                      value={emailList}
                      onChange={(e) => setEmailList(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit">Send Invitations</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Rewards Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-full mr-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Referrals</div>
                  <div className="text-xl font-bold">4</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-full mr-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Earned Rewards</div>
                  <div className="text-xl font-bold">$100</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pb-4">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-full mr-3">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Pending Rewards</div>
                  <div className="text-xl font-bold">$0</div>
                </div>
              </div>
            </div>
            
            <Button className="w-full" variant="outline">
              <Award className="h-4 w-4 mr-2" />
              View All Rewards
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Track the status of your referrals and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Recent referral activity</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Reward</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referralHistory.map(referral => (
                <TableRow key={referral.id}>
                  <TableCell className="font-medium">{referral.name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      referral.status === "Invested" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {referral.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(referral.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{referral.reward || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
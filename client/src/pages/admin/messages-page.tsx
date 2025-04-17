import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Mail, MailOpen, Trash2, MessageSquare, Users, Send } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Textarea } from "@/components/ui/textarea";

export default function AdminMessages() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  // Temporarily use a mock data approach until the API endpoint is implemented
  const { data: messages, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/admin/messages'],
    queryFn: async () => {
      // Return mock data instead of making an actual API call that would fail
      return [];
    }
  });

  const handleRefresh = () => {
    toast({
      title: "Refreshing messages",
      description: "The messages list is being updated.",
    });
    refetch();
  };

  const handleSendReply = () => {
    if (!replyText.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Message sent",
      description: "Your reply has been sent successfully.",
    });
    setReplyText('');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Skeleton className="h-10 w-full sm:w-96" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        
        <div>
          <Skeleton className="h-8 w-96 mb-4" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-60 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
        <div className="mx-auto h-12 w-12 text-destructive opacity-75">⚠️</div>
        <h3 className="mt-4 text-lg font-semibold">Failed to Load Messages</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There was an error loading the messages. Please try again later.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={handleRefresh}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Mocked conversations for UI display
  const mockConversations = [
    {
      id: 1,
      user: {
        name: "John Doe",
        avatar: null,
      },
      lastMessage: "I have a question about my investment in Skyline Apartments...",
      unread: true,
      timestamp: "2h ago"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Message Center</h2>
        <p className="text-muted-foreground">
          Manage and respond to user messages and inquiries.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inbox" className="flex gap-2 items-center justify-center">
                <MailOpen className="h-4 w-4" />
                <span>Inbox</span>
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex gap-2 items-center justify-center">
                <Send className="h-4 w-4" />
                <span>Sent</span>
              </TabsTrigger>
              <TabsTrigger value="archive" className="flex gap-2 items-center justify-center">
                <Trash2 className="h-4 w-4" />
                <span>Archive</span>
              </TabsTrigger>
            </TabsList>
            
            <Card className="mt-6 border">
              <CardContent className="p-0">
                <div className="divide-y">
                  {mockConversations.map((conversation) => (
                    <div 
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 ${selectedConversation?.id === conversation.id ? 'bg-muted/50' : ''}`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          {conversation.user.avatar ? (
                            <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden">
                              <img 
                                src={conversation.user.avatar} 
                                alt={conversation.user.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <span className="font-medium">{conversation.user.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                      </div>
                      <div className="pl-10 text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                        {conversation.unread && (
                          <Badge className="mr-2" variant="default">New</Badge>
                        )}
                        {conversation.lastMessage}
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No more messages
                  </div>
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {selectedConversation.user.avatar ? (
                        <div className="h-10 w-10 rounded-full bg-primary/10 overflow-hidden">
                          <img 
                            src={selectedConversation.user.avatar} 
                            alt={selectedConversation.user.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle>{selectedConversation.user.name}</CardTitle>
                        <CardDescription>Conversation history</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[calc(100%-160px)]">
                  <div className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                          <p>I have a question about my investment in Skyline Apartments. When will the next ROI distribution be made?</p>
                          <div className="mt-1 text-xs text-muted-foreground">2 hours ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t p-4">
                    <div className="flex gap-4">
                      <Textarea
                        placeholder="Type your reply..."
                        className="min-h-[80px]"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button onClick={handleSendReply} className="gap-2">
                        <Send className="h-4 w-4" />
                        <span>Send Reply</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10">
                <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No Conversation Selected</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Select a conversation from the inbox to view messages
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
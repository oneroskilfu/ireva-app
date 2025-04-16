import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Inbox,
  Search,
  Send,
  MessageSquare, 
  PenSquare,
  RefreshCw,
  ArrowLeft,
  X,
  Archive,
  Trash2,
  User,
  MailOpen,
  CornerLeftUp,
} from "lucide-react";

interface Message {
  id: number;
  senderId: number;
  senderName?: string;
  receiverId: number;
  receiverName?: string;
  subject?: string;
  content: string;
  status: string;
  parentMessageId?: number | null;
  isSystemMessage: boolean;
  metadata?: any;
  createdAt: string;
  readAt?: string | null;
}

interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

const InboxMessages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Message[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [composeMode, setComposeMode] = useState(false);
  const [composeTo, setComposeTo] = useState<number | null>(null);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch users for compose dropdown
  const { data: users } = useQuery({
    queryKey: ['/api/users/list'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users/list');
      return await res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch inbox messages
  const { 
    data: inboxMessages,
    isLoading: isLoadingInbox,
    isError: isErrorInbox,
    refetch: refetchInbox,
    isFetching: isFetchingInbox
  } = useQuery({
    queryKey: ['/api/messages/inbox', searchTerm, statusFilter],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      
      const endpoint = `/api/messages/inbox${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await apiRequest('GET', endpoint);
      return await res.json();
    },
    enabled: !!user?.id && activeTab === 'inbox',
  });

  // Fetch sent messages
  const { 
    data: sentMessages,
    isLoading: isLoadingSent,
    isError: isErrorSent,
    refetch: refetchSent,
    isFetching: isFetchingSent
  } = useQuery({
    queryKey: ['/api/messages/sent', searchTerm],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      
      const endpoint = `/api/messages/sent${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await apiRequest('GET', endpoint);
      return await res.json();
    },
    enabled: !!user?.id && activeTab === 'sent',
  });

  // Fetch conversation thread
  const fetchConversation = async (messageId: number) => {
    try {
      const res = await apiRequest('GET', `/api/messages/${messageId}/conversation`);
      const data = await res.json();
      setSelectedConversation(data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load the conversation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await apiRequest('PATCH', `/api/messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
    },
  });

  // Update message status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ messageId, status }: { messageId: number; status: string }) => {
      await apiRequest('PATCH', `/api/messages/${messageId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/sent'] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/messages', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/sent'] });
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
      });
      resetComposeForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Reply to message mutation
  const replyMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: number; content: string }) => {
      await apiRequest('POST', `/api/messages/${messageId}/reply`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/sent'] });
      
      if (selectedMessage) {
        fetchConversation(selectedMessage.id);
      }
      
      setReplyContent('');
      toast({
        title: 'Reply Sent',
        description: 'Your reply has been sent successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reply. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle viewing a message (load conversation and mark as read)
  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    fetchConversation(message.id);
    
    // Mark as read if it's an inbox message and unread
    if (activeTab === 'inbox' && message.status === 'unread') {
      markAsReadMutation.mutate(message.id);
    }
  };

  // Reset compose form
  const resetComposeForm = () => {
    setComposeMode(false);
    setComposeTo(null);
    setComposeSubject('');
    setComposeContent('');
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!composeTo || !composeContent.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select a recipient and enter a message.',
        variant: 'destructive',
      });
      return;
    }

    sendMessageMutation.mutate({
      senderId: user?.id,
      receiverId: composeTo,
      subject: composeSubject.trim() || undefined,
      content: composeContent.trim(),
    });
  };

  // Handle replying to a message
  const handleReply = () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a reply message.',
        variant: 'destructive',
      });
      return;
    }

    replyMutation.mutate({
      messageId: selectedMessage.id,
      content: replyContent.trim(),
    });
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Render conversation view
  const renderConversation = () => {
    if (!selectedMessage) return null;

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedMessage(null)}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {activeTab === 'inbox' ? 'Inbox' : 'Sent'}
          </Button>
          <div className="flex space-x-2">
            {activeTab === 'inbox' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ 
                    messageId: selectedMessage.id, 
                    status: 'archived' 
                  })}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    updateStatusMutation.mutate({ 
                      messageId: selectedMessage.id, 
                      status: 'deleted' 
                    });
                    setSelectedMessage(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold mb-1">
            {selectedMessage.subject || '(No Subject)'}
          </h3>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>
                {activeTab === 'inbox' 
                  ? `From: ${selectedMessage.senderName || `User #${selectedMessage.senderId}`}`
                  : `To: ${selectedMessage.receiverName || `User #${selectedMessage.receiverId}`}`}
              </span>
              {selectedMessage.isSystemMessage && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">System</Badge>
              )}
            </div>
            <span>{format(new Date(selectedMessage.createdAt), 'PPp')}</span>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {selectedConversation.map((msg, index) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[80%] rounded-lg p-4
                  ${msg.senderId === user?.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'}
                `}>
                  <div className="flex items-center mb-2">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback>
                        {msg.senderName 
                          ? getInitials(msg.senderName) 
                          : msg.isSystemMessage 
                            ? 'SY' 
                            : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {msg.senderName || (msg.isSystemMessage ? 'System' : `User #${msg.senderId}`)}
                    </span>
                    <span className="text-xs ml-2 opacity-70">
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex items-start space-x-2">
            <Avatar className="mt-1">
              <AvatarFallback>
                {user?.firstName && user?.lastName
                  ? getInitials(`${user.firstName} ${user.lastName}`)
                  : user?.username?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Type your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[120px]"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleReply} 
                  disabled={!replyContent.trim() || replyMutation.isPending}
                >
                  <CornerLeftUp className="h-4 w-4 mr-2" />
                  {replyMutation.isPending ? 'Sending...' : 'Reply'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render compose form
  const renderComposeForm = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">New Message</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetComposeForm}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 flex-1">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">To:</label>
              <Select 
                value={composeTo?.toString() || ''} 
                onValueChange={(value) => setComposeTo(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {users?.map((user: User) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.username}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Subject (Optional):</label>
              <Input
                placeholder="Subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Message:</label>
              <Textarea
                placeholder="Type your message..."
                value={composeContent}
                onChange={(e) => setComposeContent(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={resetComposeForm}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!composeTo || !composeContent.trim() || sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render messages list
  const renderMessagesList = () => {
    const currentMessages = activeTab === 'inbox' ? inboxMessages : sentMessages;
    const isLoading = activeTab === 'inbox' ? isLoadingInbox : isLoadingSent;
    const isError = activeTab === 'inbox' ? isErrorInbox : isErrorSent;
    const isFetching = activeTab === 'inbox' ? isFetchingInbox : isFetchingSent;
    const refetchMessages = activeTab === 'inbox' ? refetchInbox : refetchSent;

    if (isLoading) {
      return (
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-2 p-3 border rounded-md">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">Error loading messages</p>
          <Button onClick={() => refetchMessages()}>Try Again</Button>
        </div>
      );
    }

    if (!currentMessages || currentMessages.length === 0) {
      return (
        <div className="text-center py-16">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Messages</h3>
          <p className="text-muted-foreground mb-4">
            {activeTab === 'inbox'
              ? 'Your inbox is empty. Messages you receive will appear here.'
              : 'You have not sent any messages yet.'}
          </p>
          {activeTab === 'inbox' && (
            <Button onClick={() => setComposeMode(true)}>
              <PenSquare className="h-4 w-4 mr-2" />
              Compose New Message
            </Button>
          )}
        </div>
      );
    }

    return (
      <ScrollArea className="h-[600px]">
        <div className="p-2 space-y-2">
          {currentMessages.map((message: Message) => (
            <div
              key={message.id}
              className={`
                p-3 rounded-md border cursor-pointer hover:bg-muted transition-colors
                ${message.status === 'unread' && activeTab === 'inbox' ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''}
              `}
              onClick={() => handleViewMessage(message)}
            >
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage src={message.isSystemMessage ? undefined : undefined} />
                  <AvatarFallback>
                    {message.isSystemMessage
                      ? 'SY'
                      : activeTab === 'inbox'
                        ? message.senderName
                          ? getInitials(message.senderName)
                          : 'U'
                        : message.receiverName
                          ? getInitials(message.receiverName)
                          : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${message.status === 'unread' && activeTab === 'inbox' ? 'font-bold' : ''}`}>
                      {activeTab === 'inbox'
                        ? message.senderName || (message.isSystemMessage ? 'System' : `User #${message.senderId}`)
                        : message.receiverName || `User #${message.receiverId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <p className="text-sm font-medium truncate">
                    {message.subject || '(No Subject)'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {message.content}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    {message.isSystemMessage && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        System
                      </Badge>
                    )}
                    {message.status === 'unread' && activeTab === 'inbox' && (
                      <Badge variant="default" className="bg-primary">
                        <MailOpen className="h-3 w-3 mr-1" />
                        Unread
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Messaging</CardTitle>
            <CardDescription>
              Communicate with administrators, property developers, and other investors
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (activeTab === 'inbox') refetchInbox();
                else refetchSent();
              }}
              disabled={activeTab === 'inbox' ? isFetchingInbox : isFetchingSent}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetchingInbox || isFetchingSent ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              size="sm" 
              onClick={() => {
                setSelectedMessage(null);
                setComposeMode(true);
              }}
            >
              <PenSquare className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-4 h-[calc(100%-72px)]">
        {/* Sidebar */}
        {!selectedMessage && !composeMode && (
          <div className="col-span-1 border-r h-full">
            <div className="p-4 border-b">
              <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="inbox" className="flex items-center">
                    <Inbox className="h-4 w-4 mr-2" />
                    Inbox
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Sent
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {activeTab === 'inbox' && (
                <div className="mt-2">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Messages</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {renderMessagesList()}
          </div>
        )}
        
        {/* Right Panel */}
        <div className={`
          ${selectedMessage || composeMode ? 'col-span-1 md:col-span-4' : 'col-span-1 md:col-span-3'} 
          h-full
        `}>
          {!selectedMessage && !composeMode ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <MessageSquare className="h-24 w-24 text-muted-foreground mb-6" />
              <h3 className="text-2xl font-semibold mb-2">Select a message</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Choose a message from your {activeTab} to view its contents or compose a new message.
              </p>
              <Button 
                size="lg" 
                onClick={() => setComposeMode(true)}
              >
                <PenSquare className="h-5 w-5 mr-2" />
                New Message
              </Button>
            </div>
          ) : composeMode ? (
            renderComposeForm()
          ) : (
            renderConversation()
          )}
        </div>
      </div>
    </Card>
  );
};

export default InboxMessages;
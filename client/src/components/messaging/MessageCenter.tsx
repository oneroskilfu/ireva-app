import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Loader2, 
  Send, 
  Search, 
  Inbox, 
  MailPlus, 
  MessageSquare, 
  Users, 
  Clock, 
  ChevronDown,
  MoreHorizontal,
  Trash,
  ArchiveIcon,
  Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  sender: {
    id: number;
    name: string;
    avatar?: string;
    role?: string;
  };
  recipient: {
    id: number;
    name: string;
    avatar?: string;
    role?: string;
  };
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  parentMessageId?: number;
}

interface User {
  id: number;
  name: string;
  avatar?: string;
  role?: string;
}

const MessageCenter: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth() || { user: null };
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedConversation, setSelectedConversation] = useState<Message | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessageMode, setNewMessageMode] = useState(false);
  const [newMessageData, setNewMessageData] = useState({
    recipientId: '',
    subject: '',
    body: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get messages
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/messages/${activeTab}`);
      return await res.json();
    },
    enabled: !!user,
  });

  // Get available users for new message
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users');
      return await res.json();
    },
    enabled: !!user && newMessageMode,
  });

  // Get conversation messages
  const { data: conversation, isLoading: isLoadingConversation } = useQuery<Message[]>({
    queryKey: ['/api/messages/conversation', selectedConversation?.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/messages/${selectedConversation?.id}/conversation`);
      return await res.json();
    },
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { recipientId?: string; body: string; subject?: string; parentMessageId?: number }) => {
      const res = await apiRequest('POST', '/api/messages', messageData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      // Reset form and refresh messages
      setReplyMessage('');
      setNewMessageData({
        recipientId: '',
        subject: '',
        body: '',
      });
      setNewMessageMode(false);
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      if (selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ['/api/messages/conversation', selectedConversation.id] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest('PATCH', `/api/messages/${messageId}/read`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  // Select a conversation and mark it as read if unread
  const handleSelectConversation = (message: Message) => {
    setSelectedConversation(message);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
    setNewMessageMode(false);
  };

  // Send a reply to the current conversation
  const handleSendReply = () => {
    if (!replyMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      body: replyMessage,
      parentMessageId: selectedConversation.id,
    });
  };

  // Send a new message
  const handleSendNewMessage = () => {
    if (!newMessageData.recipientId || !newMessageData.subject || !newMessageData.body.trim()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    sendMessageMutation.mutate({
      recipientId: newMessageData.recipientId,
      subject: newMessageData.subject,
      body: newMessageData.body,
    });
  };

  // Scroll to bottom of conversation when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  // Filter messages by search query
  const filteredMessages = messages?.filter(msg =>
    msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.body.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Format date for display
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className="h-[calc(100vh-8rem)]">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle>Message Center</CardTitle>
        <CardDescription>Communicate with investors, admins, and support</CardDescription>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-8rem)]">
        <div className="flex h-full border-t">
          {/* Message sidebar */}
          <div className="w-1/3 border-r h-full flex flex-col">
            <div className="p-4 flex justify-between items-center border-b">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
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
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  setNewMessageMode(true);
                  setSelectedConversation(null);
                }}
                title="New Message"
              >
                <MailPlus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search messages..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              {isLoadingMessages ? (
                <div className="p-4 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No messages found.
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={cn(
                        "p-4 cursor-pointer hover:bg-accent/50",
                        selectedConversation?.id === message.id && "bg-accent",
                        !message.isRead && activeTab === 'inbox' && "bg-accent/20"
                      )}
                      onClick={() => handleSelectConversation(message)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          {message.sender.avatar ? (
                            <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                          ) : (
                            <AvatarFallback>
                              {message.sender.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className={cn(
                              "text-sm font-medium truncate",
                              !message.isRead && activeTab === 'inbox' && "font-semibold"
                            )}>
                              {activeTab === 'inbox' ? message.sender.name : message.recipient.name}
                            </h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {formatMessageDate(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">{message.subject}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{message.body}</p>
                        </div>
                      </div>
                      {!message.isRead && activeTab === 'inbox' && (
                        <div className="mt-1 flex justify-end">
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Message content area */}
          <div className="w-2/3 flex flex-col h-full">
            {newMessageMode ? (
              // New message form
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold mb-4">New Message</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">To:</label>
                      <Select 
                        value={newMessageData.recipientId} 
                        onValueChange={(value) => setNewMessageData({...newMessageData, recipientId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingUsers ? (
                            <div className="p-2 flex justify-center">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            <>
                              <SelectGroup>
                                <SelectLabel>Admin</SelectLabel>
                                {users?.filter(u => u.role === 'admin').map((user) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Investors</SelectLabel>
                                {users?.filter(u => u.role === 'investor').map((user) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Support</SelectLabel>
                                <SelectItem value="support">Support Team</SelectItem>
                              </SelectGroup>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject:</label>
                      <Input
                        value={newMessageData.subject}
                        onChange={(e) => setNewMessageData({...newMessageData, subject: e.target.value})}
                        placeholder="Enter message subject"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message:</label>
                      <Textarea 
                        value={newMessageData.body}
                        onChange={(e) => setNewMessageData({...newMessageData, body: e.target.value})}
                        placeholder="Type your message here..."
                        className="min-h-[200px]"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 mt-auto border-t flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setNewMessageMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendNewMessage}
                    disabled={sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : selectedConversation ? (
              // Conversation view
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {selectedConversation.sender.avatar ? (
                        <AvatarImage 
                          src={selectedConversation.sender.avatar} 
                          alt={selectedConversation.sender.name} 
                        />
                      ) : (
                        <AvatarFallback>
                          {selectedConversation.sender.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold">
                        {activeTab === 'inbox' ? selectedConversation.sender.name : selectedConversation.recipient.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.subject}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <ArchiveIcon className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  {isLoadingConversation ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {conversation?.map((message, index) => {
                        const isCurrentUser = message.sender.id === user?.id;
                        return (
                          <div 
                            key={message.id} 
                            className={cn(
                              "flex gap-4",
                              isCurrentUser && "justify-end"
                            )}
                          >
                            {!isCurrentUser && (
                              <Avatar className="h-10 w-10">
                                {message.sender.avatar ? (
                                  <AvatarImage 
                                    src={message.sender.avatar} 
                                    alt={message.sender.name} 
                                  />
                                ) : (
                                  <AvatarFallback>
                                    {message.sender.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            )}
                            
                            <div className={cn(
                              "max-w-[70%]",
                              isCurrentUser ? "text-right" : "text-left"
                            )}>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {isCurrentUser ? 'You' : message.sender.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatMessageDate(message.createdAt)}
                                </span>
                              </div>
                              
                              <div className={cn(
                                "p-3 rounded-lg",
                                isCurrentUser 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-accent"
                              )}>
                                <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                              </div>
                            </div>
                            
                            {isCurrentUser && (
                              <Avatar className="h-10 w-10">
                                {user.avatar ? (
                                  <AvatarImage 
                                    src={user.avatar} 
                                    alt={user.username || 'You'} 
                                  />
                                ) : (
                                  <AvatarFallback>
                                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            )}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                
                <div className="p-4 border-t">
                  <div className="flex gap-3">
                    <Textarea 
                      placeholder="Type your reply here..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button 
                      className="self-end"
                      onClick={handleSendReply}
                      disabled={sendMessageMutation.isPending || !replyMessage.trim()}
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Empty state
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No message selected</h3>
                <p className="text-muted-foreground max-w-md">
                  Select a message from the list to view its contents or start a new conversation.
                </p>
                <Button 
                  className="mt-6"
                  onClick={() => setNewMessageMode(true)}
                >
                  <MailPlus className="h-4 w-4 mr-2" />
                  Compose New Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageCenter;
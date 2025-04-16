import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import messageService from '@/services/messageService';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Inbox, 
  Mail as PaperPlaneOff, // Using Mail as alternative
  Users, 
  Search, 
  MailOpen, 
  Mail, 
  Reply,
  ArrowLeft
} from 'lucide-react';

// Type definitions
interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  message: string;
  isRead: boolean | null;
  readAt: Date | null;
  createdAt: Date | null;
  sender?: User;
  recipient?: User;
}

interface User {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  profileImage?: string;
}

const MessageCenter: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Fetch inbox messages
  const { 
    data: inboxMessages = [], 
    isLoading: isLoadingInbox,
    refetch: refetchInbox
  } = useQuery<Message[]>({
    queryKey: ['/api/messages/inbox'],
    queryFn: async () => {
      return await messageService.getInboxMessages();
    },
  });

  // Fetch sent messages
  const { 
    data: sentMessages = [], 
    isLoading: isLoadingSent,
    refetch: refetchSent
  } = useQuery<Message[]>({
    queryKey: ['/api/messages/sent'],
    queryFn: async () => {
      return await messageService.getSentMessages();
    },
  });

  // Fetch all users for recipient selection
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      return await messageService.getAllUsers();
    },
  });

  // Fetch conversation if a message is selected
  const { data: conversation = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedMessage?.id, 'conversation'],
    queryFn: async () => {
      if (!selectedMessage) return [];
      return await messageService.getConversation(selectedMessage.id);
    },
    enabled: !!selectedMessage,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { recipientId: number; message: string }) => {
      return await messageService.sendMessage(data);
    },
    onSuccess: () => {
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
      });
      setNewMessageText('');
      setRecipientId('');
      queryClient.invalidateQueries({ queryKey: ['/api/messages/sent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Send Message',
        description: error.message || 'An error occurred while sending your message.',
        variant: 'destructive',
      });
    },
  });

  // Reply to message mutation
  const replyMessageMutation = useMutation({
    mutationFn: async (data: { messageId: number; message: string }) => {
      const res = await apiRequest('POST', `/api/messages/${data.messageId}/reply`, { message: data.message });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Reply Sent',
        description: 'Your reply has been sent successfully.',
      });
      setReplyText('');
      if (selectedMessage) {
        queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedMessage.id, 'conversation'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/messages/sent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Send Reply',
        description: error.message || 'An error occurred while sending your reply.',
        variant: 'destructive',
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
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unread/count'] });
    },
  });

  // Handle message selection
  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    
    // If the message is unread, mark it as read
    if (message.isRead === false && message.recipientId === user?.id) {
      markAsReadMutation.mutate(message.id);
    }
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!recipientId || !newMessageText.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select a recipient and enter a message.',
        variant: 'destructive',
      });
      return;
    }

    sendMessageMutation.mutate({
      recipientId: parseInt(recipientId),
      message: newMessageText.trim(),
    });
  };

  // Handle replying to a message
  const handleReplyMessage = () => {
    if (!selectedMessage || !replyText.trim()) {
      toast({
        title: 'Empty Reply',
        description: 'Please enter a reply message.',
        variant: 'destructive',
      });
      return;
    }

    replyMessageMutation.mutate({
      messageId: selectedMessage.id,
      message: replyText.trim(),
    });
  };

  // Clear selected message
  const handleBackToList = () => {
    setSelectedMessage(null);
    setReplyText('');
  };

  // Format date
  const formatDate = (dateString: string | null | Date) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get user display name
  const getUserDisplayName = (user: User | undefined) => {
    if (!user) return 'Unknown User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  // Get avatar initials
  const getAvatarInitials = (user: User | undefined) => {
    if (!user) return 'NU';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Filter messages based on search term
  const filteredInboxMessages = inboxMessages.filter(message => 
    message.sender?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSentMessages = sentMessages.filter(message => 
    message.recipient?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto scroll to bottom of conversation
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  return (
    <Card className="w-full h-[calc(100vh-200px)] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Message Center</CardTitle>
        <CardDescription>
          Communicate with investors, property managers, and administrators
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {!selectedMessage ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="inbox" className="flex items-center">
                    <Inbox className="mr-2 h-4 w-4" /> Inbox
                    {inboxMessages.some(m => !m.isRead && m.recipientId === user?.id) && (
                      <Badge variant="default" className="ml-2 bg-primary">
                        New
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex items-center">
                    <PaperPlaneOff className="mr-2 h-4 w-4" /> Sent
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {activeTab === 'inbox' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchInbox()}
                  className="shrink-0"
                >
                  Refresh
                </Button>
              )}
              
              {activeTab === 'sent' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchSent()}
                  className="shrink-0"
                >
                  Refresh
                </Button>
              )}
            </div>

            <TabsContent value="inbox" className="mt-0 flex-1 overflow-y-auto">
              {isLoadingInbox ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : filteredInboxMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No messages match your search' : 'Your inbox is empty'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {filteredInboxMessages.map(message => (
                    <div
                      key={message.id}
                      className={`p-3 border rounded-lg hover:bg-accent cursor-pointer ${!message.isRead ? 'bg-accent/20' : ''}`}
                      onClick={() => handleSelectMessage(message)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          {message.sender?.profileImage ? (
                            <AvatarImage src={message.sender.profileImage} alt={getUserDisplayName(message.sender)} />
                          ) : (
                            <AvatarFallback>{getAvatarInitials(message.sender)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{getUserDisplayName(message.sender)}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {!message.isRead ? (
                              <Mail className="h-3 w-3 text-primary" />
                            ) : (
                              <MailOpen className="h-3 w-3 text-muted-foreground" />
                            )}
                            <p className="text-sm text-muted-foreground truncate">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent" className="mt-0 flex-1 overflow-y-auto">
              {isLoadingSent ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : filteredSentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <PaperPlaneOff className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No messages match your search' : 'You haven\'t sent any messages yet'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {filteredSentMessages.map(message => (
                    <div
                      key={message.id}
                      className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleSelectMessage(message)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          {message.recipient?.profileImage ? (
                            <AvatarImage src={message.recipient.profileImage} alt={getUserDisplayName(message.recipient)} />
                          ) : (
                            <AvatarFallback>{getAvatarInitials(message.recipient)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">To: {getUserDisplayName(message.recipient)}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(u => u.id !== user?.id) // Don't show current user
                      .map(u => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {getUserDisplayName(u)}
                          {u.role && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({u.role})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Write your message here..."
                className="min-h-[150px]"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
              />
            </TabsContent>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <Button variant="ghost" size="sm" onClick={handleBackToList} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to messages
              </Button>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar className="h-10 w-10">
                  {activeTab === 'inbox' && selectedMessage.sender?.profileImage ? (
                    <AvatarImage src={selectedMessage.sender.profileImage} alt={getUserDisplayName(selectedMessage.sender)} />
                  ) : activeTab === 'sent' && selectedMessage.recipient?.profileImage ? (
                    <AvatarImage src={selectedMessage.recipient.profileImage} alt={getUserDisplayName(selectedMessage.recipient)} />
                  ) : (
                    <AvatarFallback>
                      {activeTab === 'inbox' 
                        ? getAvatarInitials(selectedMessage.sender) 
                        : getAvatarInitials(selectedMessage.recipient)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">
                    {activeTab === 'inbox' 
                      ? getUserDisplayName(selectedMessage.sender) 
                      : `To: ${getUserDisplayName(selectedMessage.recipient)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 border rounded-lg p-3">
              {conversation.length > 0 ? (
                <div className="space-y-4">
                  {conversation.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[75%] p-3 rounded-lg ${
                          msg.senderId === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {selectedMessage.message}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                className="self-end" 
                onClick={handleReplyMessage}
                disabled={!replyText.trim() || replyMessageMutation.isPending}
              >
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      {!selectedMessage && (
        <CardFooter className="border-t pt-4">
          {activeTab !== 'new' ? (
            <Button 
              className="w-full" 
              onClick={() => setActiveTab('new')}
            >
              <Send className="mr-2 h-4 w-4" /> Compose New Message
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setActiveTab('inbox')}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleSendMessage} 
                disabled={!recipientId || !newMessageText.trim() || sendMessageMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default MessageCenter;
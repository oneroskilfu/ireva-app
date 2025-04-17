import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Send,
  User,
  Users,
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  UserCircle,
  MessagesSquare
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
  read: boolean;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
}

interface Conversation {
  id: number;
  participantId: number;
  participantName: string;
  participantRole: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/messages/conversations'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/messages/conversations');
        return await res.json();
      } catch (err) {
        // Return empty array if endpoint doesn't exist yet
        return [];
      }
    }
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages/conversation', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      try {
        const res = await apiRequest('GET', `/api/messages/conversation/${selectedConversation.id}`);
        return await res.json();
      } catch (err) {
        // Return empty array if endpoint doesn't exist yet
        return [];
      }
    },
    enabled: !!selectedConversation,
  });

  // Filter conversations by search term
  const filteredConversations = conversations.filter(
    (conversation) => 
      conversation.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    try {
      // Reset input first for better UX
      const messageToSend = messageInput;
      setMessageInput('');
      
      // Send the message to the API
      await apiRequest('POST', '/api/messages', {
        recipientId: selectedConversation.participantId,
        content: messageToSend
      });
      
      // Invalidate queries to refresh conversation data
      // This would typically be handled by the mutation but we're keeping it simple
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, 'HH:mm');
    }
    
    const isThisYear = date.getFullYear() === now.getFullYear();
    if (isThisYear) {
      return format(date, 'dd MMM');
    }
    
    return format(date, 'dd/MM/yyyy');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <Helmet>
        <title>Messages | iREVA</title>
      </Helmet>
      
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Chat with property developers, customer support, and other investors
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[700px]">
          {/* Conversations List */}
          <Card className="md:col-span-1 overflow-hidden flex flex-col">
            <CardHeader className="px-4 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button variant="ghost" size="icon">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <Tabs defaultValue="all" className="px-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
              </TabsList>
            </Tabs>
            <CardContent className="p-0 overflow-hidden flex-grow">
              <ScrollArea className="h-[calc(700px-140px)]">
                {conversationsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessagesSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No conversations found</p>
                    <p className="text-sm">
                      {searchTerm ? 'Try a different search term' : 'Start a new conversation with support or developers'}
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {filteredConversations.map((conversation) => (
                      <li
                        key={conversation.id}
                        className={`p-3 cursor-pointer hover:bg-muted flex ${
                          selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                          {conversation.participantAvatar ? (
                            <AvatarImage src={conversation.participantAvatar} alt={conversation.participantName} />
                          ) : (
                            <AvatarFallback>{getInitials(conversation.participantName)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-semibold truncate">
                              {conversation.participantName}
                              <span className="text-xs font-normal text-muted-foreground ml-2">
                                {conversation.participantRole === 'admin' ? '(Admin)' : 
                                 conversation.participantRole === 'developer' ? '(Developer)' : ''}
                              </span>
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-sm truncate text-muted-foreground">
                            {conversation.lastMessage}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="ml-2 bg-primary text-primary-foreground rounded-full h-5 min-w-5 flex items-center justify-center text-xs">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Message View */}
          <Card className="md:col-span-2 lg:col-span-3 flex flex-col h-full overflow-hidden">
            {selectedConversation ? (
              <>
                <CardHeader className="px-4 py-3 border-b flex-row items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-3">
                      {selectedConversation.participantAvatar ? (
                        <AvatarImage src={selectedConversation.participantAvatar} alt={selectedConversation.participantName} />
                      ) : (
                        <AvatarFallback>{getInitials(selectedConversation.participantName)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedConversation.participantName}</CardTitle>
                      <CardDescription className="text-xs">
                        {selectedConversation.participantRole === 'admin' ? 'Administrator' : 
                         selectedConversation.participantRole === 'developer' ? 'Property Developer' : 'Investor'}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </CardHeader>
                
                <CardContent className="p-0 overflow-hidden flex-grow">
                  <ScrollArea className="h-[calc(700px-180px)]">
                    <div className="p-4 space-y-4">
                      {messagesLoading ? (
                        <div className="flex justify-center items-center h-40">
                          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <MessagesSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                          <p>No messages yet</p>
                          <p className="text-sm">Send a message to start the conversation</p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isCurrentUser = user?.id === message.senderId;
                          
                          return (
                            <div 
                              key={message.id} 
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className="flex max-w-[85%]">
                                {!isCurrentUser && (
                                  <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                                    {message.senderAvatar ? (
                                      <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                                    ) : (
                                      <AvatarFallback>{getInitials(message.senderName)}</AvatarFallback>
                                    )}
                                  </Avatar>
                                )}
                                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                  <div 
                                    className={`px-3 py-2 rounded-lg ${
                                      isCurrentUser 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                  </div>
                                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                    <span className="mr-1">{formatMessageTime(message.timestamp)}</span>
                                    {isCurrentUser && (
                                      message.read ? (
                                        <CheckCheck className="h-3 w-3" />
                                      ) : (
                                        <Check className="h-3 w-3" />
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                
                <div className="p-3 border-t">
                  <div className="flex items-end gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      className="min-h-[60px] max-h-[120px] resize-none"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      size="icon" 
                      className="flex-shrink-0"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <UserCircle className="h-16 w-16 mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Choose a conversation from the list to view messages, or start a new conversation with support or property developers.
                </p>
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  New Conversation
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default MessagesPage;
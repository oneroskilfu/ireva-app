import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { MessageSquare, Search, RefreshCw, PenSquare } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import MessageThread from './MessageThread';
import ComposeMessage from './ComposeMessage';

const MessagingInbox = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [composeMode, setComposeMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'UN';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleCompose = () => {
    setSelectedMessage(null);
    setComposeMode(true);
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setComposeMode(false);
  };

  const handleBack = () => {
    setSelectedMessage(null);
    setComposeMode(false);
  };

  const handleRefresh = () => {
    if (activeTab === 'inbox') {
      refetchInbox();
    } else {
      refetchSent();
    }
  };

  // Render messages list
  const renderMessagesList = () => {
    const messages = activeTab === 'inbox' ? inboxMessages : sentMessages;
    const isLoading = activeTab === 'inbox' ? isLoadingInbox : isLoadingSent;
    const isError = activeTab === 'inbox' ? isErrorInbox : isErrorSent;

    if (isLoading) {
      return Array(5).fill(0).map((_, i) => (
        <div key={i} className="p-4 border-b flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ));
    }

    if (isError) {
      return (
        <div className="p-4 text-center text-red-500">
          Failed to load messages. Please try again.
        </div>
      );
    }

    if (!messages || messages.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No messages found</p>
        </div>
      );
    }

    return messages.map((message) => (
      <div 
        key={message.id} 
        className={`p-4 border-b hover:bg-muted/30 cursor-pointer ${
          message.isRead ? '' : 'bg-muted/20 font-medium'
        }`}
        onClick={() => handleViewMessage(message)}
      >
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {activeTab === 'inbox' 
                ? getInitials(message.sender?.name)
                : getInitials(message.recipient?.name)
              }
            </AvatarFallback>
            {activeTab === 'inbox' && message.sender?.avatar && (
              <AvatarImage src={message.sender.avatar} />
            )}
            {activeTab === 'sent' && message.recipient?.avatar && (
              <AvatarImage src={message.recipient.avatar} />
            )}
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {activeTab === 'inbox' 
                  ? message.sender?.name || `User #${message.senderId}`
                  : message.recipient?.name || `User #${message.recipientId}`
                }
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(message.createdAt), 'MMM d, h:mm a')}
              </span>
            </div>
            
            <div className="mt-1">
              <p className="text-sm truncate">
                {message.subject || '(No subject)'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {message.message?.substring(0, 100)}
              </p>
            </div>
            
            <div className="mt-1 flex items-center gap-2">
              {!message.isRead && activeTab === 'inbox' && (
                <Badge variant="secondary" className="px-2 py-0 text-xs">
                  New
                </Badge>
              )}
              {message.isSystemMessage && (
                <Badge variant="outline" className="px-2 py-0 text-xs bg-blue-100 text-blue-800">
                  System
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <Card className="w-full h-full max-h-[800px]">
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
              onClick={handleRefresh}
              disabled={activeTab === 'inbox' ? isFetchingInbox : isFetchingSent}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetchingInbox || isFetchingSent ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              size="sm" 
              onClick={handleCompose}
            >
              <PenSquare className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-4 h-[calc(100%-72px)]">
        {/* Sidebar with message list */}
        {!selectedMessage && !composeMode && (
          <div className="col-span-1 border-r h-full">
            <div className="p-4 border-b">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="inbox">Inbox</TabsTrigger>
                  <TabsTrigger value="sent">Sent</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="mt-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100%-90px)]">
              {renderMessagesList()}
            </ScrollArea>
          </div>
        )}
        
        {/* Main content area */}
        <div className={`${selectedMessage || composeMode ? 'col-span-4' : 'col-span-3'}`}>
          {!selectedMessage && !composeMode && (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Select a message or start a new conversation</h3>
              <p className="text-muted-foreground mb-6">
                Use messaging to communicate with administrators, property developers, and other stakeholders
              </p>
              <Button onClick={handleCompose}>
                <PenSquare className="h-4 w-4 mr-2" />
                Compose New Message
              </Button>
            </div>
          )}
          
          {selectedMessage && (
            <MessageThread 
              message={selectedMessage} 
              onBack={handleBack}
              refetchMessages={handleRefresh}
              isInbox={activeTab === 'inbox'}
            />
          )}
          
          {composeMode && (
            <ComposeMessage 
              onBack={handleBack} 
              onSuccess={() => {
                handleBack();
                handleRefresh();
              }}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default MessagingInbox;
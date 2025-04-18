import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Archive, 
  Trash2, 
  CornerLeftUp,
  User
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MessageThread = ({ message, onBack, refetchMessages, isInbox = true }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replyContent, setReplyContent] = useState('');
  const [conversationMessages, setConversationMessages] = useState([]);

  // Fetch conversation thread
  const { 
    data: conversation, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/messages/conversation', message.id],
    queryFn: async () => {
      if (!user?.id || !message?.id) throw new Error('Missing required data');
      const res = await apiRequest('GET', `/api/messages/${message.id}/conversation`);
      return await res.json();
    },
    enabled: !!user?.id && !!message?.id,
    onSuccess: (data) => {
      setConversationMessages(data);
    }
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      await apiRequest('PATCH', `/api/messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      if (refetchMessages) refetchMessages();
    },
  });

  // Update message status mutation (archive/delete)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ messageId, status }) => {
      await apiRequest('PATCH', `/api/messages/${messageId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/sent'] });
      if (refetchMessages) refetchMessages();
      onBack();
      toast({
        title: 'Message Updated',
        description: 'The message status has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update message status.',
        variant: 'destructive',
      });
    }
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ messageId, content }) => {
      await apiRequest('POST', `/api/messages/${messageId}/reply`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/sent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversation', message.id] });
      
      setReplyContent('');
      toast({
        title: 'Reply Sent',
        description: 'Your reply has been sent successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reply. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mark as read when viewing an unread message
  useEffect(() => {
    if (isInbox && message?.id && !message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  }, [message?.id, isInbox, message?.isRead]);

  // Handle sending a reply
  const handleReply = () => {
    if (!replyContent.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a reply message.',
        variant: 'destructive',
      });
      return;
    }

    replyMutation.mutate({
      messageId: message.id,
      content: replyContent.trim(),
    });
  };

  // Handle archiving a message
  const handleArchive = () => {
    updateStatusMutation.mutate({ 
      messageId: message.id, 
      status: 'archived' 
    });
  };

  // Handle deleting a message
  const handleDelete = () => {
    updateStatusMutation.mutate({ 
      messageId: message.id, 
      status: 'deleted' 
    });
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

  if (!message) return null;

  const messages = conversationMessages.length > 0 ? conversationMessages : [message];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {isInbox && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleArchive}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>
      
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold mb-1">
          {message.subject || '(No Subject)'}
        </h3>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              {isInbox 
                ? `From: ${message.sender?.name || `User #${message.senderId}`}`
                : `To: ${message.recipient?.name || `User #${message.recipientId}`}`}
            </span>
            {message.isSystemMessage && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">System</Badge>
            )}
          </div>
          <span>{format(new Date(message.createdAt), 'PPp')}</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {isLoading ? (
            <div className="text-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading conversation...</p>
            </div>
          ) : isError ? (
            <div className="text-center p-4 text-red-500">
              Failed to load conversation. Please try again.
            </div>
          ) : (
            messages.map((msg) => (
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
                        {msg.sender?.name 
                          ? getInitials(msg.sender.name) 
                          : msg.isSystemMessage 
                            ? 'SY' 
                            : 'U'}
                      </AvatarFallback>
                      {msg.sender?.avatar && (
                        <AvatarImage src={msg.sender.avatar} />
                      )}
                    </Avatar>
                    <span className="text-sm font-medium">
                      {msg.sender?.name || (msg.isSystemMessage ? 'System' : `User #${msg.senderId}`)}
                    </span>
                    <span className="text-xs ml-2 opacity-70">
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap">{msg.message || msg.content}</div>
                </div>
              </div>
            ))
          )}
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
            {user?.profileImage && (
              <AvatarImage src={user.profileImage} />
            )}
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

export default MessageThread;
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { Send, AlertCircle, ChevronRight, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: number;
  recipientId: number;
  senderId: number;
  body: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    role: string;
  };
}

interface MessageThreadProps {
  recipientId: number;
  onSendSuccess?: () => void;
}

const MessageThread = ({ recipientId, onSendSuccess }: MessageThreadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch message thread
  const {
    data: messages,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['/api/messages/thread', recipientId],
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when thread is opened
  useEffect(() => {
    const markAsRead = async () => {
      try {
        await apiRequest('POST', `/api/messages/read/${recipientId}`);
        queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };
    
    if (recipientId) {
      markAsRead();
    }
  }, [recipientId, queryClient]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageBody: string) => {
      const response = await apiRequest('POST', '/api/messages/send', {
        recipientId,
        body: messageBody,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      refetch();
      if (onSendSuccess) {
        onSendSuccess();
      }
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Group messages by date
  const groupedMessages = messages
    ? messages.reduce((groups: { [key: string]: Message[] }, message: Message) => {
        const date = new Date(message.createdAt).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
        return groups;
      }, {})
    : {};

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load messages</h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading this conversation. Please try again.
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-muted-foreground mb-4">
            Start a conversation by sending a message below.
          </p>
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-start space-x-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-h-[80px] resize-none"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
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
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {Object.entries(groupedMessages).map(([date, messagesForDate]) => (
          <div key={date} className="mb-6">
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {format(new Date(date), 'MMMM d, yyyy')}
              </Badge>
            </div>
            
            {messagesForDate.map((message) => {
              const isCurrentUser = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                    <Avatar className={`h-8 w-8 ${isCurrentUser ? 'ml-2' : 'mr-2'}`}>
                      <AvatarImage src={message.sender.profileImage} />
                      <AvatarFallback>
                        {getInitials(message.sender.firstName, message.sender.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className={`flex items-center mb-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageDate(message.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words">{message.body}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex items-start space-x-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-h-[80px] resize-none"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
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
  );
};

export default MessageThread;
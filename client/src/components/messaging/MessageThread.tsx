import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { format, parseISO, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  MoreVertical,
  ChevronLeft,
  User,
  Clock,
  Loader2,
  AlertCircle,
  Paperclip,
  Image,
  Smile,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Message {
  id: number;
  content: string;
  subject?: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  status: 'read' | 'unread' | 'archived' | 'deleted';
  readAt?: string;
  isFromMe: boolean;
}

interface User {
  id: number;
  username: string;
  fullName: string;
  profileImage: string | null;
}

interface ThreadData {
  messages: Message[];
  user: User | null;
}

const MessageThread = () => {
  const { userId } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch thread data
  const {
    data: threadData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ThreadData>({
    queryKey: [`/api/messages/thread/${userId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/messages/thread/${userId}`);
      const data = await response.json();
      return data;
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/messages/send', {
        receiverId: Number(userId),
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: [`/api/messages/thread/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [threadData?.messages]);

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  // Format date for display
  const formatMessageDate = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const date = new Date(message.createdAt);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  // Format date header
  const formatDateHeader = (dateKey: string) => {
    const date = parseISO(dateKey);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d, yyyy');
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return '??';
    
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  // Error state
  if (isError || !threadData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load conversation</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          There was an error loading this conversation. Please try again later.
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  // If the user doesn't exist
  if (!threadData.user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">User not found</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          This user doesn't exist or has been removed from the platform.
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Return to Inbox
        </Button>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(threadData.messages);

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full">
        {/* Header */}
        <CardHeader className="py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 md:hidden"
                onClick={() => window.history.back()}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={threadData.user.profileImage || ''}
                  alt={threadData.user.username}
                />
                <AvatarFallback>
                  {getInitials(threadData.user.fullName || threadData.user.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">
                  {threadData.user.fullName || threadData.user.username}
                </CardTitle>
                <CardDescription className="text-xs">
                  @{threadData.user.username}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Mark All as Read</DropdownMenuItem>
                <DropdownMenuItem>Block User</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete Conversation</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto py-6 px-4 md:px-6">
          {threadData.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="rounded-full bg-muted p-3 mb-4">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground mb-6 max-w-xs">
                Start a conversation with {threadData.user.fullName || threadData.user.username}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(messageGroups).map(([dateKey, messagesForDate]) => (
                <div key={dateKey} className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="bg-muted text-xs px-2 py-1 rounded-md text-muted-foreground">
                      {formatDateHeader(dateKey)}
                    </div>
                  </div>
                  {messagesForDate.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%]">
                        {!message.isFromMe && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage
                              src={threadData.user?.profileImage || ''}
                              alt={threadData.user?.username}
                            />
                            <AvatarFallback>
                              {getInitials(
                                threadData.user?.fullName || threadData.user?.username || ''
                              )}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-lg px-4 py-2 max-w-full break-words ${
                            message.isFromMe
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {message.subject && (
                            <div className="font-medium mb-1">{message.subject}</div>
                          )}
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          <div
                            className={`text-[10px] mt-1 flex items-center ${
                              message.isFromMe
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <Clock className="h-2.5 w-2.5 inline mr-1" />
                            {formatMessageDate(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>

        {/* Message Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-between">
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach a file</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                        <Image className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach an image</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add emoji</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default MessageThread;
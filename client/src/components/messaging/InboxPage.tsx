import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import {
  Search,
  MessageSquare,
  Users,
  Clock,
  Filter,
  Loader2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NewMessageForm from './NewMessageForm';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface ThreadSummary {
  userId: number;
  username: string;
  fullName: string;
  profileImage: string | null;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

const InboxPage = () => {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showNewMessageSheet, setShowNewMessageSheet] = useState(false);

  // Fetch inbox data
  const { data: inboxData, isLoading, isError } = useQuery<ThreadSummary[]>({
    queryKey: ['/api/messages/inbox'],
  });

  // Filter threads based on search term and filter
  const filteredThreads = inboxData
    ? inboxData.filter((thread) => {
        const matchesSearch =
          thread.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          thread.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (thread.lastMessage && thread.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter =
          filter === 'all' ||
          (filter === 'unread' && thread.unreadCount > 0) ||
          (filter === 'read' && thread.unreadCount === 0);

        return matchesSearch && matchesFilter;
      })
    : [];

  // Format date for display
  const formatMessageDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (date.getFullYear() === new Date().getFullYear()) {
      return format(date, 'MMM d');
    } else {
      return format(date, 'MM/dd/yy');
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

  // Navigate to thread detail page
  const navigateToThread = (userId: number) => {
    navigate(`/dashboard/messages/${userId}`);
  };

  // Handle new message sent
  const handleMessageSent = () => {
    setShowNewMessageSheet(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load messages</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          There was an error loading your messages. Please try again later.
        </p>
        <Button>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Connect with property developers and administrators
          </p>
        </div>
        <Sheet open={showNewMessageSheet} onOpenChange={setShowNewMessageSheet}>
          <SheetTrigger asChild>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Send New Message</SheetTitle>
              <SheetDescription>
                Send a message to a property developer or administrator
              </SheetDescription>
            </SheetHeader>
            <NewMessageForm onMessageSent={handleMessageSent} />
          </SheetContent>
        </Sheet>
      </div>

      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Inbox</CardTitle>
          <CardDescription>Your message conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts or messages..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Mark all as read</DropdownMenuItem>
                  <DropdownMenuItem>Archive selected</DropdownMenuItem>
                  <DropdownMenuItem>Delete selected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No messages found</h3>
              <p className="text-muted-foreground mb-6 max-w-xs">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You have no messages yet. Start a conversation!'}
              </p>
              <Button onClick={() => setShowNewMessageSheet(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <div className="divide-y">
                {filteredThreads.map((thread) => (
                  <div
                    key={thread.userId}
                    className={`flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      thread.unreadCount > 0 ? 'bg-muted/20' : ''
                    }`}
                    onClick={() => navigateToThread(thread.userId)}
                  >
                    <Avatar className="h-10 w-10 mr-4 flex-shrink-0">
                      <AvatarImage src={thread.profileImage || ''} alt={thread.username} />
                      <AvatarFallback>{getInitials(thread.fullName || thread.username)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="truncate">
                          <span className={thread.unreadCount > 0 ? 'font-semibold' : 'font-medium'}>
                            {thread.fullName || thread.username}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">@{thread.username}</span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatMessageDate(thread.lastMessageDate)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground truncate mt-1">
                        {thread.lastMessage}
                      </div>
                    </div>
                    {thread.unreadCount > 0 && (
                      <Badge className="ml-2" variant="default">
                        {thread.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InboxPage;
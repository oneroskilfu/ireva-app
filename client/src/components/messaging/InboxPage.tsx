import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Helmet } from 'react-helmet-async';
import { formatDistanceToNow } from 'date-fns';
import {
  Search,
  MessageSquare,
  Edit,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import MessageThread from './MessageThread';
import NewMessageForm from './NewMessageForm';

interface Message {
  id: number;
  recipientId: number;
  senderId: number;
  subject: string;
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

interface Thread {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  role: string;
  unreadCount: number;
  lastMessageAt: string;
  lastMessage: string;
}

const InboxPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Fetch inbox threads
  const {
    data: threads,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['/api/messages/inbox'],
  });

  // Filter threads by search term
  const filteredThreads = threads
    ? threads.filter((thread: Thread) => {
        const fullName = `${thread.firstName} ${thread.lastName}`.toLowerCase();
        const username = thread.username.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return fullName.includes(searchLower) || username.includes(searchLower);
      })
    : [];

  const handleThreadClick = (thread: Thread) => {
    setActiveThread(thread);
  };

  const handleNewMessageSuccess = () => {
    setIsComposing(false);
    refetch();
  };

  const handleThreadClose = () => {
    setActiveThread(null);
    refetch(); // Refresh inbox after closing thread
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Helmet>
          <title>Messages | iREVA</title>
        </Helmet>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button disabled>
            <Edit className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages..."
            className="pl-8"
            disabled
          />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center p-3 rounded-md border animate-pulse"
            >
              <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
              <div className="w-4 h-4 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="flex flex-col h-full">
        <Helmet>
          <title>Messages | iREVA</title>
        </Helmet>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button disabled>
            <Edit className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load messages</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading your messages. Please try again.
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>Messages | iREVA</title>
      </Helmet>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Button onClick={() => setIsComposing(true)}>
          <Edit className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search messages..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredThreads.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg border-dashed">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No messages found</h3>
          {searchTerm ? (
            <p className="text-muted-foreground">
              No messages matching your search term. Try different keywords.
            </p>
          ) : threads?.length === 0 ? (
            <p className="text-muted-foreground">
              Your inbox is empty. Start a conversation by clicking "New Message".
            </p>
          ) : (
            <p className="text-muted-foreground">
              No messages found. Try starting a new conversation.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2 overflow-auto">
          {filteredThreads.map((thread: Thread) => (
            <div
              key={thread.userId}
              className={`flex items-center p-3 rounded-md border transition-colors hover:bg-muted/50 cursor-pointer ${
                thread.unreadCount > 0 ? 'bg-primary/5 border-primary/10' : ''
              }`}
              onClick={() => handleThreadClick(thread)}
            >
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={thread.profileImage} />
                <AvatarFallback>
                  {getInitials(thread.firstName, thread.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium truncate">
                    {thread.firstName
                      ? `${thread.firstName} ${thread.lastName}`
                      : thread.username}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(thread.lastMessageAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {thread.lastMessage}
                </div>
              </div>
              <div className="ml-2 flex items-center">
                {thread.unreadCount > 0 && (
                  <Badge className="mr-2">{thread.unreadCount}</Badge>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Thread Side Panel */}
      <Sheet open={!!activeThread} onOpenChange={(open) => !open && handleThreadClose()}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-hidden flex flex-col p-0">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={activeThread?.profileImage} />
                  <AvatarFallback>
                    {activeThread
                      ? getInitials(activeThread.firstName, activeThread.lastName)
                      : ''}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {activeThread?.firstName
                    ? `${activeThread.firstName} ${activeThread.lastName}`
                    : activeThread?.username}
                  <Badge 
                    variant="outline" 
                    className={`ml-2 text-xs ${
                      activeThread?.role === 'admin' || activeThread?.role === 'super_admin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {activeThread?.role === 'admin' || activeThread?.role === 'super_admin'
                      ? 'Admin'
                      : 'Investor'}
                  </Badge>
                </div>
              </div>
            </SheetTitle>
            <Separator />
            <SheetDescription>
              {activeThread && (
                <MessageThread 
                  recipientId={activeThread.userId} 
                  onSendSuccess={refetch}
                />
              )}
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      {/* New Message Side Panel */}
      <Sheet open={isComposing} onOpenChange={setIsComposing}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-hidden flex flex-col">
          <SheetHeader className="mb-4">
            <SheetTitle>New Message</SheetTitle>
            <SheetDescription>
              Send a message to an admin or investor.
            </SheetDescription>
          </SheetHeader>
          <NewMessageForm onSuccess={handleNewMessageSuccess} onCancel={() => setIsComposing(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default InboxPage;
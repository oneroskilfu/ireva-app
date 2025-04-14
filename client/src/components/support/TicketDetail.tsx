import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, PaperclipIcon, RefreshCcw, Send } from "lucide-react";

interface TicketDetailProps {
  ticketId: number;
  onBack: () => void;
}

interface TicketData {
  ticket: {
    id: number;
    userId: number;
    subject: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    channel: string;
    propertyId: number | null;
    investmentId: number | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
  };
  messages: {
    id: number;
    ticketId: number;
    userId: number;
    content: string;
    isFromStaff: boolean;
    attachmentUrl: string | null;
    createdAt: string;
    user: {
      id: number;
      username: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      isAdmin: boolean;
    };
  }[];
  property: any | null;
  investment: any | null;
}

const TicketDetail = ({ ticketId, onBack }: TicketDetailProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");

  // Query to fetch ticket details and messages
  const { data, isLoading, isError, refetch } = useQuery<TicketData>({
    queryKey: ['/api/support/tickets', ticketId],
    enabled: !!ticketId,
  });

  // Mutation to send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest('POST', `/api/support/tickets/${ticketId}/messages`, {
        content
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      });
      setNewMessage(""); // Clear input
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets', ticketId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation to close the ticket
  const closeTicketMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PATCH', `/api/support/tickets/${ticketId}`, {
        status: 'closed'
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Ticket closed',
        description: 'This support ticket has been marked as closed.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['/api/support/my-tickets'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to close ticket',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Button variant="ghost" size="sm" className="w-fit mb-2" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to tickets
          </Button>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Skeleton className="h-20 w-full" />
        </CardFooter>
      </Card>
    );
  }

  // Render error state
  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <Button variant="ghost" size="sm" className="w-fit mb-2" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to tickets
          </Button>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load ticket details</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const { ticket, messages, property, investment } = data;

  // Get status color for badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500 text-white';
      case 'open':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'resolved':
        return 'bg-purple-500 text-white';
      case 'closed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // User can't reply to closed tickets
  const canReply = ticket.status !== 'closed';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="sm" className="w-fit" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to tickets
          </Button>
          <Badge className={getStatusColor(ticket.status)}>
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </Badge>
        </div>
        <CardTitle>{ticket.subject}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
          <span>Ticket #{ticket.id}</span>
          <span>•</span>
          <span>Created: {formatDate(ticket.createdAt)}</span>
          <span>•</span>
          <span>Category: {ticket.category}</span>
          {ticket.resolvedAt && (
            <>
              <span>•</span>
              <span>Resolved: {formatDate(ticket.resolvedAt)}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Original ticket message */}
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarFallback>
                {data.ticket.userId === user?.id ? user?.username?.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
              <AvatarImage src={null} alt="User" />
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium text-sm">
                  {data.ticket.userId === user?.id ? 'You' : 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(ticket.createdAt)}
                </p>
              </div>
              <div className="text-sm">{ticket.description}</div>
            </div>
          </div>
        </div>

        {/* Related information */}
        {(property || investment) && (
          <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
            <h4 className="text-sm font-medium mb-2">Related Information</h4>
            {property && (
              <div className="text-xs text-muted-foreground mb-1">
                <span className="font-medium">Property:</span> {property.name}
              </div>
            )}
            {investment && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Investment:</span> #{investment.id} - ₦{investment.amount.toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Message thread */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Conversation</h3>
          
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3">
              No replies yet. Our team will respond to your ticket soon.
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex items-start gap-3 ${
                    message.isFromStaff ? 'bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg' : ''
                  }`}
                >
                  <Avatar>
                    {message.isFromStaff ? (
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        S
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback>
                        {message.user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                    <AvatarImage src={null} alt={message.isFromStaff ? 'Staff' : 'User'} />
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-sm">
                        {message.isFromStaff 
                          ? 'Support Staff' 
                          : message.user?.id === user?.id 
                            ? 'You' 
                            : message.user?.username || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    {message.attachmentUrl && (
                      <div className="mt-2">
                        <a 
                          href={message.attachmentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                        >
                          <PaperclipIcon className="h-3 w-3 mr-1" /> Attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply form */}
        {canReply ? (
          <div className="space-y-3 pt-3 border-t">
            <h3 className="text-sm font-medium">Reply to this ticket</h3>
            <Textarea
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={4}
              className="w-full"
            />
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => closeTicketMutation.mutate()}
                disabled={closeTicketMutation.isPending}
              >
                {closeTicketMutation.isPending ? 'Closing...' : 'Close Ticket'}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? 'Sending...' : 'Send Reply'}
                <Send className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-3 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              This ticket is closed. You cannot reply to it.
            </p>
            <Button variant="outline" size="sm" onClick={onBack}>
              Back to Tickets
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketDetail;
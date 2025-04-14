import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Paperclip, AlertCircle, Clock, Calendar, Tag, User as UserIcon } from "lucide-react";

interface Message {
  id: number;
  ticketId: number;
  userId: number;
  isFromStaff: boolean;
  content: string;
  attachment: string | null;
  createdAt: string;
}

interface Ticket {
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
  messages: Message[];
  user: {
    username: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  }
}

interface TicketDetailProps {
  ticketId: number;
  onBack: () => void;
}

const TicketDetail = ({ ticketId, onBack }: TicketDetailProps) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ticket details
  const { data: ticket, isLoading } = useQuery<Ticket>({
    queryKey: ['/api/support/tickets', ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const response = await fetch(`/api/support/tickets/${ticketId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      
      return response.json();
    }
  });

  // Add a new message mutation
  const addMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/support/tickets/${ticketId}/messages`, { content });
      return await res.json();
    },
    onSuccess: () => {
      setNewMessage("");
      // Invalidate the ticket query to refresh messages
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets', ticketId] });
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle message submission
  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim().length === 0) return;
    
    addMessageMutation.mutate(newMessage);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (status) {
      case "new":
        return "default";
      case "open":
      case "in-progress":
        return "secondary";
      case "resolved":
      case "closed":
        return "outline";
      default:
        return "default";
    }
  };

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (priority) {
      case "low":
        return "outline";
      case "medium":
        return "default";
      case "high":
        return "secondary";
      case "urgent":
        return "destructive";
      default:
        return "default";
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="p-0 h-8 w-8 mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-xl">
              {isLoading ? <Skeleton className="h-6 w-64" /> : ticket?.subject}
            </CardTitle>
            <CardDescription>
              {isLoading ? <Skeleton className="h-4 w-32 mt-1" /> : `Ticket #${ticket?.id}`}
            </CardDescription>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-wrap gap-2 mt-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        ) : ticket && (
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant={getStatusBadgeVariant(ticket.status)} className="capitalize">
              {ticket.status.replace("-", " ")}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="capitalize">
              {ticket.priority}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {ticket.category}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {ticket.channel}
            </Badge>

            <div className="flex-1" />
            
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>Created: {formatDate(ticket.createdAt)}</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          // Skeleton loading state
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Separator />
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full max-w-xl" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-full max-w-xl" />
                </div>
              </div>
            </div>
          </div>
        ) : ticket && (
          <>
            {/* Initial ticket description */}
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {getInitials(ticket.user.firstName 
                      ? `${ticket.user.firstName} ${ticket.user.lastName || ''}`
                      : ticket.user.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">
                    {ticket.user.firstName 
                      ? `${ticket.user.firstName} ${ticket.user.lastName || ''}`
                      : ticket.user.username}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(ticket.createdAt)}
                  </div>
                </div>
              </div>
              <p className="whitespace-pre-line text-sm">{ticket.description}</p>
            </div>

            <Separator />

            {/* Message thread */}
            {ticket.messages && ticket.messages.length > 0 ? (
              <div className="space-y-4">
                {ticket.messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      {message.isFromStaff ? (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          RS
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback>
                          {getInitials(ticket.user.firstName 
                            ? `${ticket.user.firstName} ${ticket.user.lastName || ''}`
                            : ticket.user.username)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-sm">
                          {message.isFromStaff ? 'Support Staff' : (
                            ticket.user.firstName 
                              ? `${ticket.user.firstName} ${ticket.user.lastName || ''}`
                              : ticket.user.username
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <div className={`p-3 rounded-lg text-sm ${
                        message.isFromStaff 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-muted/30 border'
                      }`}>
                        <p className="whitespace-pre-line">{message.content}</p>
                        {message.attachment && (
                          <a 
                            href={message.attachment} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-primary hover:underline mt-2 text-xs"
                          >
                            <Paperclip className="h-3 w-3 mr-1" />
                            Attachment
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No replies yet. Add a message below.</p>
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex-col pt-2">
        <Separator className="mb-4" />
        
        {/* Reply form */}
        <form onSubmit={handleSubmitMessage} className="w-full">
          <div className="space-y-3">
            <Textarea 
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-24"
              disabled={isLoading || !ticket || addMessageMutation.isPending}
            />
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                disabled={isLoading || !ticket || addMessageMutation.isPending}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach File
              </Button>
              <Button 
                type="submit" 
                disabled={newMessage.trim().length === 0 || isLoading || !ticket || addMessageMutation.isPending}
              >
                {addMessageMutation.isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
};

export default TicketDetail;
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

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

// Form schema for new message
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

const TicketDetail = ({ ticketId, onBack }: TicketDetailProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isResolving, setIsResolving] = useState(false);

  // Query to fetch ticket details
  const { data: ticketData, isLoading } = useQuery<TicketData>({
    queryKey: ['/api/support/tickets', ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/support/tickets/${ticketId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      
      return response.json();
    }
  });

  // Form for new message
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  // Mutation to add a new message
  const addMessageMutation = useMutation({
    mutationFn: async (values: MessageFormValues) => {
      const res = await apiRequest("POST", `/api/support/tickets/${ticketId}/messages`, values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets', ticketId] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to update ticket status
  const updateTicketStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("PATCH", `/api/support/tickets/${ticketId}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['/api/support/my-tickets'] });
      setIsResolving(false);
      toast({
        title: "Ticket Updated",
        description: "The ticket status was updated successfully.",
      });
    },
    onError: (error: Error) => {
      setIsResolving(false);
      toast({
        title: "Failed to update ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle message submission
  const onSubmit = (values: MessageFormValues) => {
    addMessageMutation.mutate(values);
  };

  // Handle resolving ticket
  const handleResolveTicket = () => {
    setIsResolving(true);
    updateTicketStatusMutation.mutate("resolved");
  };

  // Handle reopening ticket
  const handleReopenTicket = () => {
    setIsResolving(true);
    updateTicketStatusMutation.mutate("in-progress");
  };

  // Get status badge color based on status
  const getStatusBadgeVariant = (status: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (status) {
      case "pending":
        return "default";
      case "in-progress":
        return "secondary";
      case "resolved":
        return "outline";
      default:
        return "default";
    }
  };

  // Get priority badge color based on priority
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

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-32 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (!ticketData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Ticket Not Found</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This ticket may have been deleted or doesn't exist.</p>
        </CardContent>
      </Card>
    );
  }

  const { ticket, messages, property, investment } = ticketData;
  const isResolved = ticket.status === "resolved";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>{ticket.subject}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
              {ticket.priority}
            </Badge>
            <Badge variant={getStatusBadgeVariant(ticket.status)}>
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
          <div>
            Ticket #{ticket.id} • {format(new Date(ticket.createdAt), "MMM d, yyyy")}
          </div>
          <div className="capitalize">
            Category: {ticket.category.replace('-', ' ')}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ticket details */}
        <div className="p-4 bg-muted/50 rounded-md">
          <p className="text-sm mb-2">{ticket.description}</p>
          
          {/* Related property or investment */}
          {(property || investment) && (
            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
              {property && (
                <div className="flex items-center">
                  <span className="font-medium mr-1">Related Property:</span>
                  <span>{property.name}</span>
                </div>
              )}
              {investment && (
                <div className="flex items-center">
                  <span className="font-medium mr-1">Related Investment:</span>
                  <span>₦{investment.amount.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto px-1 py-2">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.isFromStaff ? "justify-start" : "justify-end"}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isFromStaff 
                    ? "bg-muted text-muted-foreground" 
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium">
                    {message.isFromStaff ? "Support Team" : "You"}
                  </span>
                  <span className="text-xs opacity-75">
                    {format(new Date(message.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.attachmentUrl && (
                  <a 
                    href={message.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center mt-2 text-xs underline"
                  >
                    View attachment
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reply form */}
        {!isResolved && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Type your reply here..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={addMessageMutation.isPending}
                  className="flex items-center"
                >
                  {addMessageMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Resolution notice */}
        {isResolved && (
          <div className="text-center p-4 border rounded-md bg-muted/30">
            <p className="text-muted-foreground mb-2">
              This ticket has been resolved. 
              {ticket.resolvedAt && ` Resolved on ${format(new Date(ticket.resolvedAt), "MMM d, yyyy")}.`}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReopenTicket}
              disabled={isResolving}
            >
              {isResolving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reopening...
                </>
              ) : (
                "Reopen Ticket"
              )}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Footer actions */}
      {!isResolved && (
        <CardFooter className="flex justify-between border-t pt-4">
          <Button 
            variant="outline" 
            onClick={onBack}
          >
            Back to List
          </Button>
          <Button 
            variant="default" 
            onClick={handleResolveTicket}
            disabled={isResolving}
          >
            {isResolving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resolving...
              </>
            ) : (
              "Mark as Resolved"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TicketDetail;
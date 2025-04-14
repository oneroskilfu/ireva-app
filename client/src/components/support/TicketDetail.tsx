import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  ChevronLeft, 
  Clock, 
  Calendar, 
  Loader2, 
  Building, 
  CreditCard, 
  Tag, 
  AlertCircle 
} from "lucide-react";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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

// Message form validation schema
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty")
});

type MessageFormValues = z.infer<typeof messageSchema>;

const TicketDetail = ({ ticketId, onBack }: TicketDetailProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.isAdmin;

  // Query to fetch ticket details
  const { data, isLoading, isError } = useQuery<TicketData>({
    queryKey: ['/api/support/tickets', ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/support/tickets/${ticketId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      return response.json();
    }
  });

  // Form setup for sending messages
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: ""
    }
  });

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async (values: MessageFormValues) => {
      const response = await apiRequest("POST", `/api/support/tickets/${ticketId}/messages`, values);
      return response.json();
    },
    onSuccess: () => {
      // Reset form
      form.reset();
      
      // Invalidate ticket query to refresh the messages
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets', ticketId] });
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Message",
        description: error.message || "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update ticket status mutation (for closing/reopening tickets)
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PATCH", `/api/support/tickets/${ticketId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate ticket query to refresh the ticket
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['/api/support/my-tickets'] });
      
      toast({
        title: "Ticket Updated",
        description: "The ticket status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Ticket",
        description: error.message || "There was an error updating the ticket. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: MessageFormValues) => {
    addMessageMutation.mutate(values);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (status) {
      case "new":
        return "default";
      case "open":
        return "secondary";
      case "in-progress":
        return "secondary";
      case "resolved":
        return "outline";
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

  // Close or reopen ticket
  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };

  // User name display
  const getUserDisplayName = (user: { username: string; firstName: string | null; lastName: string | null; }) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  // User avatar fallback
  const getUserAvatarFallback = (user: { username: string; firstName: string | null; lastName: string | null; }) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-7 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="md:w-3/4">
              <Skeleton className="h-32 w-full mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
            <div className="md:w-1/4">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <CardTitle>Error Loading Ticket</CardTitle>
          <CardDescription>
            There was an error loading the ticket details. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/support/tickets', ticketId] })}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { ticket, messages, property, investment } = data;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Breadcrumb className="flex-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={onBack}>Support</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Ticket #{ticket.id}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(ticket.status)} className="capitalize">
              {ticket.status.replace("-", " ")}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="capitalize">
              {ticket.priority}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-xl md:text-2xl">{ticket.subject}</CardTitle>
        <CardDescription className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          <span className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            Created: {formatDate(ticket.createdAt)}
          </span>
          <span className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-1" />
            Last updated: {formatDate(ticket.updatedAt)}
          </span>
          <span className="flex items-center text-sm">
            <Tag className="h-4 w-4 mr-1" />
            Category: <span className="capitalize ml-1">{ticket.category}</span>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content */}
          <div className="md:w-3/4">
            {/* Ticket description */}
            <div className="mb-6 p-4 border rounded-md bg-muted/20">
              <div className="flex items-start mb-3">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback>
                    {user && getUserAvatarFallback(user)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user && getUserDisplayName(user)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(ticket.createdAt)}
                  </div>
                </div>
              </div>
              <div className="pl-11">
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 mb-6">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-4 border rounded-md ${
                    message.isFromStaff ? "bg-muted/30 ml-6" : "bg-muted/10 mr-6"
                  }`}
                >
                  <div className="flex items-start mb-3">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback className={message.isFromStaff ? "bg-primary text-primary-foreground" : ""}>
                        {getUserAvatarFallback(message.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center">
                        {getUserDisplayName(message.user)}
                        {message.isFromStaff && (
                          <Badge variant="outline" className="ml-2 text-xs">Staff</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="pl-11">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply form */}
            {ticket.status !== "closed" && (
              <div className="pl-11">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              placeholder="Write your reply..." 
                              className="min-h-[100px]" 
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
                      >
                        {addMessageMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Reply"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="border rounded-md">
              <div className="p-4 border-b">
                <h3 className="font-medium mb-1">Ticket Information</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Status:</span>
                    <Badge variant={getStatusBadgeVariant(ticket.status)} className="mt-1 capitalize">
                      {ticket.status.replace("-", " ")}
                    </Badge>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground block">Priority:</span>
                    <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="mt-1 capitalize">
                      {ticket.priority}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-muted-foreground block">Channel:</span>
                    <span className="capitalize">{ticket.channel || "web"}</span>
                  </div>
                  
                  {property && (
                    <div>
                      <span className="text-muted-foreground block">Related Property:</span>
                      <div className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{property.name}</span>
                      </div>
                    </div>
                  )}
                  
                  {investment && (
                    <div>
                      <span className="text-muted-foreground block">Related Investment:</span>
                      <div className="flex items-center mt-1">
                        <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>₦{investment.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Status change buttons */}
                  <div className="pt-2">
                    {ticket.status === "closed" ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full"
                              onClick={() => handleStatusChange("open")}
                              disabled={updateStatusMutation.isPending}
                            >
                              {updateStatusMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Reopen Ticket"
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reopen this ticket if you need further assistance</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full"
                              onClick={() => handleStatusChange("closed")}
                              disabled={updateStatusMutation.isPending}
                            >
                              {updateStatusMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Close Ticket"
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Close this ticket if your issue has been resolved</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  {/* Admin-only actions */}
                  {isAdmin && ticket.status !== "closed" && (
                    <div className="pt-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              className="w-full"
                              onClick={() => handleStatusChange("in-progress")}
                              disabled={updateStatusMutation.isPending || ticket.status === "in-progress"}
                            >
                              {updateStatusMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Mark In Progress"
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mark this ticket as being worked on</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                  
                  {/* Warning for closed tickets */}
                  {ticket.status === "closed" && (
                    <div className="flex items-start mt-4 text-xs p-2 border rounded bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p>This ticket is closed. You can reopen it if you need further assistance.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketDetail;
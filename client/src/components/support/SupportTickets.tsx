import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CheckCircle, Clock, HelpCircle, MessageCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TicketDetail from "./TicketDetail";
import { apiRequest } from "@/lib/queryClient";

// Type for support tickets
interface SupportTicket {
  id: number;
  userId: number;
  subject: string;
  description: string;
  category: string;
  status: 'new' | 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  channel: 'email' | 'phone' | 'chat' | 'social' | 'web';
  propertyId: number | null;
  investmentId: number | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-blue-500';
    case 'open':
      return 'bg-green-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'resolved':
      return 'bg-purple-500';
    case 'closed':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'new':
      return <MessageCircle className="h-4 w-4" />;
    case 'open':
      return <HelpCircle className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'resolved':
      return <CheckCircle className="h-4 w-4" />;
    case 'closed':
      return <XCircle className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'bg-blue-100 text-blue-800';
    case 'medium':
      return 'bg-green-100 text-green-800';
    case 'high':
      return 'bg-yellow-100 text-yellow-800';
    case 'urgent':
      return 'bg-orange-100 text-orange-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const SupportTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

  // Query to fetch user's tickets
  const { data: tickets, isLoading, isError } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/my-tickets'],
    enabled: !!user,
  });

  // Mutation to close a ticket
  const closeTicketMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      const res = await apiRequest('PATCH', `/api/support/tickets/${ticketId}`, {
        status: 'closed'
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Ticket closed',
        description: 'Your support ticket has been closed successfully.',
      });
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

  // Handle closing a ticket
  const handleCloseTicket = (ticketId: number) => {
    closeTicketMutation.mutate(ticketId);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load your support tickets</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/support/my-tickets'] })}
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Render ticket detail if a ticket is selected
  if (selectedTicket !== null) {
    return (
      <TicketDetail
        ticketId={selectedTicket}
        onBack={() => setSelectedTicket(null)}
      />
    );
  }

  // Render empty state
  if (!tickets || tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Support Tickets</CardTitle>
          <CardDescription>You haven't created any support tickets yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you need help with your account, investments, or have any other questions,
            create a new support ticket and our team will assist you.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="default" onClick={() => document.querySelector('[value="new"]')?.dispatchEvent(new Event('click'))}>
            Create New Ticket
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Render tickets list
  return (
    <div className="space-y-4">
      {tickets.map(ticket => (
        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                <CardDescription className="flex items-center space-x-2 mt-1">
                  <span>Ticket #{ticket.id}</span>
                  <span>•</span>
                  <span>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </Badge>
                <Badge className={`flex items-center gap-1 ${getStatusColor(ticket.status)} text-white`}>
                  {getStatusIcon(ticket.status)}
                  <span>{ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</span>
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Category: {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setSelectedTicket(ticket.id)}
            >
              View Details
            </Button>
            {ticket.status !== 'closed' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCloseTicket(ticket.id)}
                disabled={closeTicketMutation.isPending}
              >
                {closeTicketMutation.isPending ? 'Closing...' : 'Close Ticket'}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SupportTickets;
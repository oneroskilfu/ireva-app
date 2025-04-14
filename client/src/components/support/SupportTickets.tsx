import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import TicketDetail from "./TicketDetail";

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
}

const SupportTickets = () => {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Query to fetch user's tickets
  const { data: tickets, isLoading } = useQuery<Ticket[]>({
    queryKey: ['/api/support/my-tickets'],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/support/my-tickets');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      return response.json();
    }
  });

  // Filter tickets based on active tab
  const filteredTickets = tickets?.filter(ticket => {
    if (activeTab === "all") return true;
    if (activeTab === "open") return ["pending", "in-progress"].includes(ticket.status);
    if (activeTab === "closed") return ticket.status === "resolved";
    return true;
  });

  // Handler to view a ticket's details
  const handleViewTicket = (ticketId: number) => {
    setSelectedTicket(ticketId);
  };

  // Handler to go back to ticket list
  const handleBackToList = () => {
    setSelectedTicket(null);
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

  // If a ticket is selected, show ticket detail view
  if (selectedTicket !== null) {
    return <TicketDetail ticketId={selectedTicket} onBack={handleBackToList} />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>Manage your support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>View and manage your support requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {/* Empty state */}
            {(!filteredTickets || filteredTickets.length === 0) && (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <p className="text-muted-foreground mb-4">You don't have any {activeTab !== "all" ? activeTab : ""} support tickets yet.</p>
                <Button 
                  variant="default" 
                  onClick={() => document.querySelector('[value="new"]')?.dispatchEvent(new Event('click'))}
                >
                  Create a Support Ticket
                </Button>
              </div>
            )}

            {/* Ticket list */}
            {filteredTickets && filteredTickets.length > 0 && (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="border rounded-md p-4 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => handleViewTicket(ticket.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-base">{ticket.subject}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(ticket.status)}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <span className="mr-2">#{ticket.id}</span>
                        <span className="capitalize">{ticket.category.replace('-', ' ')}</span>
                      </div>
                      <span>
                        {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SupportTickets;
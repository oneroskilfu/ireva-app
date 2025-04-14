import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import TicketDetail from "./TicketDetail";
import { Search, Filter, Clock, Calendar, Tag } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter tickets based on active tab and search query
  const filteredTickets = tickets?.filter(ticket => {
    // Filter by status tab
    const statusMatch = 
      activeTab === "all" || 
      (activeTab === "open" && ["new", "open", "in-progress"].includes(ticket.status)) ||
      (activeTab === "closed" && ["resolved", "closed"].includes(ticket.status));
    
    // Filter by search query
    const searchMatch = 
      searchQuery === "" || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Handler to view a ticket's details
  const handleViewTicket = (ticketId: number) => {
    setSelectedTicket(ticketId);
  };

  // Handler to go back to ticket list
  const handleBackToList = () => {
    setSelectedTicket(null);
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
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // If a ticket is selected, show the ticket detail view
  if (selectedTicket !== null) {
    return <TicketDetail ticketId={selectedTicket} onBack={handleBackToList} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>View and manage your support tickets</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tabs for filtering tickets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Tickets</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
            <div className="flex items-center">
              <div className="relative mr-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tickets..."
                  className="pl-8 w-[200px] md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="shrink-0"
                title="More filters"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content for all tabs */}
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              // Loading state
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : filteredTickets && filteredTickets.length > 0 ? (
              // Tickets list
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="border rounded-md p-4 hover:border-primary/50 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => handleViewTicket(ticket.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{ticket.subject}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={getStatusBadgeVariant(ticket.status)} className="capitalize">
                          {ticket.status.replace("-", " ")}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="capitalize">
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                      {ticket.description}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(ticket.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Last updated: {formatDate(ticket.updatedAt)}
                      </span>
                      <span className="flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="text-center py-12 border rounded-md">
                <div className="mb-4">
                  <div className="inline-block p-3 bg-muted rounded-full mb-2">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No tickets found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? `No tickets matching "${searchQuery}" found.` 
                      : activeTab === "all" 
                        ? "You haven't created any support tickets yet." 
                        : `You don't have any ${activeTab} tickets.`
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => document.querySelector('[value="new"]')?.dispatchEvent(new Event('click'))}
                  >
                    Create New Ticket
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SupportTickets;
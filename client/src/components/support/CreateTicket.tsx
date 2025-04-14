import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CreateTicketProps {
  onSuccess?: () => void;
}

// Form validation schema
const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum(["general", "property", "investment", "account", "payment", "technical"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  channel: z.enum(["web", "email", "phone", "mobile-app"]).default("web"),
  propertyId: z.number().optional().nullable(),
  investmentId: z.number().optional().nullable(),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const CreateTicket = ({ onSuccess }: CreateTicketProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  // Form setup
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "general",
      priority: "medium",
      channel: "web",
      propertyId: null,
      investmentId: null,
    },
  });

  // Query for properties (to link ticket to a property)
  const { data: properties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    }
  });

  // Query for user's investments (to link ticket to an investment)
  const { data: investments, isLoading: isLoadingInvestments } = useQuery({
    queryKey: ['/api/investments/user'],
    enabled: !!user && !!selectedProperty,
    queryFn: async () => {
      const response = await fetch('/api/investments/user');
      if (!response.ok) {
        throw new Error('Failed to fetch investments');
      }
      return response.json();
    }
  });

  // Filtered investments based on selected property
  const filteredInvestments = investments?.filter(
    investment => investment.propertyId === selectedProperty
  );

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (values: TicketFormValues) => {
      const response = await apiRequest("POST", "/api/support/tickets", values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Support Ticket Created",
        description: "Your support ticket has been submitted successfully.",
      });
      
      // Reset form
      form.reset();
      
      // Invalidate tickets query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/support/my-tickets'] });
      
      // Call onSuccess prop if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Ticket",
        description: error.message || "There was an error creating your support ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: TicketFormValues) => {
    createTicketMutation.mutate(values);
  };

  // Handle property change to filter investments
  const handlePropertyChange = (propertyId: string) => {
    const id = parseInt(propertyId);
    setSelectedProperty(id);
    form.setValue("propertyId", id);
    form.setValue("investmentId", null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Support Ticket</CardTitle>
        <CardDescription>
          Submit a new support ticket to get help from our team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief summary of your issue" {...field} />
                  </FormControl>
                  <FormDescription>
                    Keep it short and descriptive
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="property">Property Related</SelectItem>
                      <SelectItem value="investment">Investment Related</SelectItem>
                      <SelectItem value="account">Account Issues</SelectItem>
                      <SelectItem value="payment">Payment Issues</SelectItem>
                      <SelectItem value="technical">Technical Problems</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Please select appropriate priority level
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Related Property (Optional) */}
            {form.watch("category") === "property" && properties && properties.length > 0 && (
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Property</FormLabel>
                    <Select 
                      onValueChange={(value) => handlePropertyChange(value)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((property: any) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a property if your issue is property-specific
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Related Investment (Optional) */}
            {form.watch("category") === "investment" && 
             selectedProperty && 
             filteredInvestments && 
             filteredInvestments.length > 0 && (
              <FormField
                control={form.control}
                name="investmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Investment</FormLabel>
                    <Select 
                      onValueChange={(value) => form.setValue("investmentId", parseInt(value))}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an investment (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredInvestments.map((investment: any) => (
                          <SelectItem key={investment.id} value={investment.id.toString()}>
                            ₦{investment.amount.toLocaleString()} - {investment.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select an investment if your issue is investment-specific
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please describe your issue in detail" 
                      className="min-h-[150px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide as much detail as possible to help us understand and resolve your issue
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={createTicketMutation.isPending}
            >
              {createTicketMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Ticket...
                </>
              ) : (
                "Submit Ticket"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateTicket;
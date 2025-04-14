import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";

// Form schema
const ticketFormSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string({ required_error: "Please select a category" }),
  priority: z.string({ required_error: "Please select a priority" }),
  channel: z.string({ required_error: "Please select a channel" }),
  propertyId: z.string().optional(),
  investmentId: z.string().optional(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface Property {
  id: number;
  name: string;
}

interface Investment {
  id: number;
  propertyId: number;
  amount: number;
}

interface CreateTicketProps {
  onSuccess?: () => void;
}

const CreateTicket = ({ onSuccess }: CreateTicketProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query properties for selection
  const { data: properties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    enabled: !!user,
  });
  
  // Query investments for selection
  const { data: investments } = useQuery<Investment[]>({
    queryKey: ['/api/investments/my-investments'],
    enabled: !!user,
  });
  
  // Default form values
  const defaultValues: Partial<TicketFormValues> = {
    category: "general",
    priority: "medium",
    channel: "portal",
  };
  
  // Form setup
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues,
  });
  
  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (values: TicketFormValues) => {
      // Convert any string IDs to numbers where needed
      const data = {
        ...values,
        propertyId: values.propertyId ? parseInt(values.propertyId) : null,
        investmentId: values.investmentId ? parseInt(values.investmentId) : null,
      };
      
      const res = await apiRequest("POST", "/api/support/tickets", data);
      return await res.json();
    },
    onSuccess: () => {
      form.reset(defaultValues);
      queryClient.invalidateQueries({ queryKey: ['/api/support/my-tickets'] });
      toast({
        title: "Support ticket created",
        description: "Your support ticket has been submitted successfully.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating ticket",
        description: error.message || "There was an error creating your ticket. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Form submission handler
  const onSubmit = (values: TicketFormValues) => {
    createTicketMutation.mutate(values);
  };
  
  // Watching channel for conditional fields
  const selectedChannel = form.watch("channel");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Support Ticket</CardTitle>
        <CardDescription>Submit a new ticket to get help from our support team</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of your issue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="payment">Payment & Billing</SelectItem>
                        <SelectItem value="property">Property Information</SelectItem>
                        <SelectItem value="investment">Investment Issues</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      Select based on how urgently you need assistance
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="portal">Portal Messages</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How would you like us to communicate with you?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedChannel === 'email' && user?.email === null && (
                <div className="flex items-center text-yellow-600 bg-yellow-50 p-3 rounded border border-yellow-200 col-span-3">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">
                    No email address found in your profile. Please add an email to your account settings to use this contact method.
                  </p>
                </div>
              )}
              
              {selectedChannel === 'phone' && user?.phoneNumber === null && (
                <div className="flex items-center text-yellow-600 bg-yellow-50 p-3 rounded border border-yellow-200 col-span-3">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">
                    No phone number found in your profile. Please add a phone number to your account settings to use this contact method.
                  </p>
                </div>
              )}
              
              {(form.watch("category") === "property" || form.watch("category") === "investment") && (
                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Property</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {properties?.map(property => (
                            <SelectItem 
                              key={property.id} 
                              value={property.id.toString()}
                            >
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {form.watch("category") === "investment" && investments && investments.length > 0 && (
                <FormField
                  control={form.control}
                  name="investmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Investment</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select investment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {investments?.map(investment => (
                            <SelectItem 
                              key={investment.id} 
                              value={investment.id.toString()}
                            >
                              ₦{investment.amount.toLocaleString()} - ID: {investment.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide as much detail as possible about your issue" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include any relevant information that might help our support team assist you better
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full md:w-auto" 
              disabled={createTicketMutation.isPending}
            >
              {createTicketMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : "Submit Ticket"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateTicket;
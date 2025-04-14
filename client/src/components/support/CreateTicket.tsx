import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, PaperclipIcon } from "lucide-react";

// Form schema
const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters").max(100, "Subject cannot exceed 100 characters"),
  category: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select a priority"),
  description: z.string().min(20, "Please provide more details (at least 20 characters)"),
  propertyId: z.number().nullable().optional(),
  investmentId: z.number().nullable().optional(),
  channel: z.string().default("web"),
  message: z.string().optional(),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface CreateTicketProps {
  onSuccess?: () => void;
}

const CreateTicket = ({ onSuccess }: CreateTicketProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("");

  // Query to get properties for selection
  const { data: properties } = useQuery({
    queryKey: ['/api/properties'],
  });

  // Query to get user's investments
  const { data: investments } = useQuery({
    queryKey: ['/api/investments/user'],
    enabled: !!user,
  });

  // Form
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      category: "",
      priority: "medium",
      description: "",
      propertyId: null,
      investmentId: null,
      channel: "web",
      message: "",
    },
  });

  // Mutation to create ticket
  const createTicketMutation = useMutation({
    mutationFn: async (values: TicketFormValues) => {
      const res = await apiRequest("POST", "/api/support/tickets", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Ticket created",
        description: "Your support ticket has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/support/my-tickets'] });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: TicketFormValues) => {
    createTicketMutation.mutate(values);
  };

  // Category options
  const categories = [
    { value: "account", label: "Account Management" },
    { value: "investment", label: "Investment Issues" },
    { value: "payment", label: "Payment Problems" },
    { value: "property", label: "Property Inquiries" },
    { value: "technical", label: "Technical Support" },
    { value: "kyc", label: "KYC Verification" },
    { value: "feedback", label: "Feedback & Suggestions" },
    { value: "other", label: "Other Issues" },
  ];

  // Priority options
  const priorities = [
    { value: "low", label: "Low - General questions or non-urgent issues" },
    { value: "medium", label: "Medium - Standard issues requiring attention" },
    { value: "high", label: "High - Significant issues affecting usage" },
    { value: "urgent", label: "Urgent - Critical problems requiring immediate attention" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Support Ticket</CardTitle>
        <CardDescription>
          Let us know how we can help you. We'll respond as soon as possible.
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
                    <Input placeholder="Brief description of your issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCategory(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
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
                        <SelectGroup>
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conditional fields based on category */}
            {(selectedCategory === "investment" || selectedCategory === "property") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Property selection */}
                {selectedCategory === "property" && properties && properties.length > 0 && (
                  <FormField
                    control={form.control}
                    name="propertyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Property</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a property" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {properties.map((property: any) => (
                              <SelectItem key={property.id} value={property.id.toString()}>
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the property related to your inquiry
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Investment selection */}
                {selectedCategory === "investment" && investments && investments.length > 0 && (
                  <FormField
                    control={form.control}
                    name="investmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Investment</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an investment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {investments.map((investment: any) => (
                              <SelectItem key={investment.id} value={investment.id.toString()}>
                                #{investment.id} - ₦{investment.amount.toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the investment related to your inquiry
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe your issue in detail. Include any relevant information that might help us resolve your problem faster."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide as much information as possible to help us assist you effectively.
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
              {createTicketMutation.isPending ? "Submitting..." : "Submit Support Ticket"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-6">
        <div className="flex items-center text-sm text-muted-foreground">
          <HelpCircle className="h-4 w-4 mr-2 text-primary" />
          <span>Need immediate help? Call our support line at +234-8000-REVA</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CreateTicket;
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Form validation schema
const issueSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().optional(),
  priority: z.string().optional(),
});

type IssueFormValues = z.infer<typeof issueSchema>;

const CATEGORIES = [
  { value: 'general', label: 'General Issue' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'account', label: 'Account Issue' },
  { value: 'payment', label: 'Payment Issue' },
  { value: 'investment', label: 'Investment Issue' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

interface IssueFormProps {
  onSuccess?: () => void;
  className?: string;
}

const IssueForm: React.FC<IssueFormProps> = ({ 
  onSuccess,
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Form setup
  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: IssueFormValues) => {
      const response = await apiRequest('POST', '/api/issues', data);
      return response.json();
    },
    onSuccess: () => {
      setFormStatus('success');
      form.reset();
      toast({
        title: "Issue Submitted",
        description: "Your issue has been submitted successfully. We'll look into it shortly.",
      });
      
      // Invalidate any issues queries
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      setFormStatus('error');
      toast({
        title: "Error",
        description: error.message || "Failed to submit issue. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: IssueFormValues) => {
    setFormStatus('idle');
    submitMutation.mutate(data);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Report an Issue</CardTitle>
        <CardDescription>
          Encountered a problem? Report it here and our team will look into it promptly.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the issue"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A short, clear title helps us categorize and address your issue faster.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the category that best fits your issue.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How urgent is this issue?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide detailed information about the issue, including any steps to reproduce it..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The more details you provide, the faster we can help resolve your issue.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {formStatus === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Issue Submitted</AlertTitle>
                <AlertDescription className="text-green-700">
                  Thank you for reporting this issue! Our team will review it and respond soon.
                </AlertDescription>
              </Alert>
            )}
            
            {formStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was a problem submitting your issue. Please try again.
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : "Submit Issue"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default IssueForm;
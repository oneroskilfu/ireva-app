import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  Clock,
  Loader2,
  MessageSquare,
  Users,
  UserPlus,
  AlertTriangle,
  Edit,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Link } from 'wouter';

// Comment form validation schema
const commentSchema = z.object({
  comment: z.string().min(1, "Comment is required"),
  isInternal: z.boolean().default(false),
});

type CommentFormValues = z.infer<typeof commentSchema>;

// Status update validation schema
const statusUpdateSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  assignedTo: z.number().optional().nullable(),
});

type StatusUpdateFormValues = z.infer<typeof statusUpdateSchema>;

// Helper functions for badges
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'open':
      return 'default'; // Blue
    case 'in_progress':
      return 'purple'; // Purple
    case 'resolved':
      return 'green'; // Green
    case 'closed':
      return 'secondary'; // Gray
    default:
      return 'default';
  }
};

const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'secondary'; // Gray
    case 'medium':
      return 'default'; // Blue
    case 'high':
      return 'orange'; // Orange
    case 'critical':
      return 'destructive'; // Red
    default:
      return 'default';
  }
};

interface IssueDetailProps {
  issueId: number;
  className?: string;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ issueId, className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const [activeTab, setActiveTab] = useState<string>("discussion");
  
  // Fetch issue details
  const { 
    data: issue, 
    isLoading, 
    isError,
    refetch,
  } = useQuery({
    queryKey: ['/api/issues', issueId],
    queryFn: async () => {
      const response = await fetch(`/api/issues/${issueId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch issue details');
      }
      return await response.json();
    }
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-NG', options);
  };
  
  // Calculate time since creation for display
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const pastDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  };
  
  // Comment form setup
  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comment: '',
      isInternal: false,
    },
  });
  
  // Status update form setup
  const statusForm = useForm<StatusUpdateFormValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: issue?.status || 'open',
      assignedTo: issue?.assignedTo || null,
    },
  });
  
  // Update status form values when issue data loads
  React.useEffect(() => {
    if (issue) {
      statusForm.reset({
        status: issue.status,
        assignedTo: issue.assignedTo,
      });
    }
  }, [issue, statusForm]);
  
  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: async (data: CommentFormValues) => {
      const response = await apiRequest('POST', `/api/issues/${issueId}/comments`, data);
      return response.json();
    },
    onSuccess: () => {
      commentForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/issues', issueId] });
      toast({
        title: "Comment added",
        description: "Your comment has been added to the issue.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update issue status mutation
  const statusMutation = useMutation({
    mutationFn: async (data: StatusUpdateFormValues) => {
      const response = await apiRequest('PATCH', `/api/issues/${issueId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/issues', issueId] });
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
      toast({
        title: "Issue updated",
        description: "The issue status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update issue. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handlers
  const onCommentSubmit = (data: CommentFormValues) => {
    commentMutation.mutate(data);
  };
  
  const onStatusSubmit = (data: StatusUpdateFormValues) => {
    statusMutation.mutate(data);
  };
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading issue details...</span>
          </div>
        </CardHeader>
      </Card>
    );
  }
  
  if (isError || !issue) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            We couldn't load the issue details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium">Issue not found</h3>
            <p className="text-muted-foreground mt-2">
              The issue you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/issues">
              <Button className="mt-4">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Issues
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <Breadcrumb className="mb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/issues">Issues</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Issue #{issue.id}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl md:text-2xl">{issue.title}</CardTitle>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge variant={getStatusBadgeVariant(issue.status)}>
                  {issue.status.replace('_', ' ')}
                </Badge>
                <Badge variant={getPriorityBadgeVariant(issue.priority)}>
                  {issue.priority}
                </Badge>
                <Badge variant="outline">{issue.category}</Badge>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {getTimeAgo(issue.createdAt)}
                </div>
              </div>
            </div>
            
            <Link href="/issues">
              <Button variant="outline" size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left sidebar with issue details */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="text-lg font-medium mb-3">Issue Description</h3>
              <p className="whitespace-pre-line text-card-foreground">
                {issue.description}
              </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="discussion">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussion ({issue.comments?.length || 0})
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="activity">
                    <Clock className="h-4 w-4 mr-2" />
                    Activity Log
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="discussion" className="space-y-6">
                {issue.comments && issue.comments.length > 0 ? (
                  <div className="space-y-4">
                    {issue.comments.map((comment: any) => (
                      <div 
                        key={comment.id} 
                        className={`p-4 rounded-lg border ${
                          comment.isInternal ? 'bg-amber-50 border-amber-200' : 'bg-card'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className="font-medium">{comment.commenter?.username || 'Unknown User'}</div>
                            {comment.isInternal && (
                              <Badge variant="warning" className="ml-2 bg-amber-500">Internal Note</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{formatDate(comment.createdAt)}</div>
                        </div>
                        <p className="whitespace-pre-line">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No comments yet</h3>
                    <p className="text-muted-foreground mt-2">
                      Be the first to comment on this issue.
                    </p>
                  </div>
                )}
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md">Add Comment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...commentForm}>
                      <form onSubmit={commentForm.handleSubmit(onCommentSubmit)} className="space-y-4">
                        <FormField
                          control={commentForm.control}
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Add a comment or update..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {isAdmin && (
                          <FormField
                            control={commentForm.control}
                            name="isInternal"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Internal Note</FormLabel>
                                  <FormDescription>
                                    Mark this comment as internal (only visible to admins)
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={commentMutation.isPending}
                        >
                          {commentMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : "Add Comment"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {isAdmin && (
                <TabsContent value="activity" className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Activity Log</h3>
                    <p className="text-muted-foreground mt-2">
                      A detailed log of all actions on this issue will be shown here.
                    </p>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
          
          {/* Right sidebar with metadata and actions */}
          <div className="space-y-6">
            {/* Status and assignment section - Admin only */}
            {isAdmin && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-md">Update Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...statusForm}>
                    <form onSubmit={statusForm.handleSubmit(onStatusSubmit)} className="space-y-4">
                      <FormField
                        control={statusForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={statusMutation.isPending}
                      >
                        {statusMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : "Update Issue"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            
            {/* Metadata section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Issue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span>#{issue.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created by:</span>
                  <span>{issue.reporter?.username || 'Unknown User'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created on:</span>
                  <span>{formatDate(issue.createdAt)}</span>
                </div>
                {issue.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last updated:</span>
                    <span>{formatDate(issue.updatedAt)}</span>
                  </div>
                )}
                {issue.assignedTo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned to:</span>
                    <span>{issue.assignee?.username || 'Unknown'}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={getStatusBadgeVariant(issue.status)}>
                    {issue.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge variant={getPriorityBadgeVariant(issue.priority)}>
                    {issue.priority}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{issue.category}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Help section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  For urgent issues or additional support, contact our support team directly.
                </p>
                <Button variant="outline" className="w-full mt-2">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueDetail;
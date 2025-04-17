import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define form schema
const formSchema = z.object({
  recipientId: z.number({
    required_error: 'Please select a recipient',
  }),
  body: z.string().min(1, {
    message: 'Message cannot be empty',
  }),
});

interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  role: string;
}

interface NewMessageFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialRecipientId?: number;
}

const NewMessageForm = ({ onSuccess, onCancel, initialRecipientId }: NewMessageFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  // Fetch potential recipients
  const { data: recipients, isLoading: isLoadingRecipients } = useQuery({
    queryKey: ['/api/users/messageable'],
    retry: 1,
  });

  // Form initialization
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientId: initialRecipientId || 0,
      body: '',
    },
  });

  // Update form when initialRecipientId changes
  useEffect(() => {
    if (initialRecipientId) {
      form.setValue('recipientId', initialRecipientId);
    }
  }, [initialRecipientId, form]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest('POST', '/api/messages/send', values);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    sendMessageMutation.mutate(values);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'UN';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="recipientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient</FormLabel>
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                      disabled={isLoadingRecipients}
                    >
                      {isLoadingRecipients ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading recipients...
                        </span>
                      ) : field.value ? (
                        recipients?.find((user: User) => user.id === field.value)?.username ||
                        "Select recipient"
                      ) : (
                        "Select recipient"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-full">
                    <Command>
                      <CommandInput placeholder="Search recipients..." />
                      <CommandEmpty>No recipients found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-auto">
                        {recipients?.map((user: User) => (
                          <CommandItem
                            key={user.id}
                            value={user.username}
                            onSelect={() => {
                              form.setValue('recipientId', user.id);
                              setOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profileImage} />
                                <AvatarFallback>
                                  {getInitials(user.firstName, user.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">
                                  {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.username}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  @{user.username}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  user.role === 'admin' || user.role === 'super_admin'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }
                              >
                                {user.role === 'admin' || user.role === 'super_admin'
                                  ? 'Admin'
                                  : 'Investor'}
                              </Badge>
                              {user.id === field.value && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Type your message here..."
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={sendMessageMutation.isPending}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={sendMessageMutation.isPending || !form.formState.isValid}
          >
            {sendMessageMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewMessageForm;
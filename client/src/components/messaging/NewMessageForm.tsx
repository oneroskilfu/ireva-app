import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchIcon, Loader2, Users, Send } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Form schema
const formSchema = z.object({
  receiverId: z.coerce.number({
    required_error: 'You must select a recipient',
  }),
  subject: z.string().optional(),
  content: z.string().min(1, 'Message is required'),
});

type FormValues = z.infer<typeof formSchema>;

// User interface
interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage: string | null;
  role: string;
}

// Props interface
interface NewMessageFormProps {
  onMessageSent?: () => void;
  initialReceiverId?: number;
}

const NewMessageForm = ({ onMessageSent, initialReceiverId }: NewMessageFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);

  // Fetch users for recipient selection
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/users');
      return response.json();
    },
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiverId: initialReceiverId || 0,
      subject: '',
      content: '',
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest('POST', '/api/messages/send', values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      if (onMessageSent) {
        onMessageSent();
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

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    sendMessageMutation.mutate(values);
  };

  // Get user's full name
  const getUserFullName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } 
    if (user.firstName) {
      return user.firstName;
    }
    if (user.lastName) {
      return user.lastName;
    }
    return user.username;
  };

  // Filter users based on search term
  const filteredUsers = users
    ? users.filter((user) => {
        const fullName = getUserFullName(user);
        return (
          fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  // Get selected user
  const selectedUser = initialReceiverId && users
    ? users.find((user) => user.id === initialReceiverId)
    : null;

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return '??';
    
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <FormField
          control={form.control}
          name="receiverId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Recipient</FormLabel>
              <Popover open={isUserSearchOpen} onOpenChange={setIsUserSearchOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={`w-full justify-between ${!field.value ? 'text-muted-foreground' : ''}`}
                    >
                      {field.value && selectedUser ? (
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={selectedUser.profileImage || ''} />
                            <AvatarFallback>{getInitials(getUserFullName(selectedUser))}</AvatarFallback>
                          </Avatar>
                          {getUserFullName(selectedUser)}
                        </div>
                      ) : (
                        <span>Select a recipient</span>
                      )}
                      <Users className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-full" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search users..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                      className="h-9"
                    />
                    {isLoadingUsers ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-y-auto">
                          {filteredUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.id.toString()}
                              onSelect={() => {
                                form.setValue('receiverId', user.id);
                                setIsUserSearchOpen(false);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profileImage || ''} />
                                <AvatarFallback>{getInitials(getUserFullName(user))}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{getUserFullName(user)}</span>
                                <span className="text-xs text-muted-foreground">@{user.username}</span>
                              </div>
                              <span className="ml-auto text-xs uppercase bg-muted px-2 py-0.5 rounded">
                                {user.role}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
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

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={sendMessageMutation.isPending}>
            {sendMessageMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Message
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewMessageForm;
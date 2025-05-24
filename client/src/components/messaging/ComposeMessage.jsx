import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { X, Send } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ComposeMessage = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  // Fetch users for recipient selection
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users/list'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users/list');
      return await res.json();
    },
    enabled: !!user?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      await apiRequest('POST', '/api/messages', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/sent'] });
      
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
      });
      
      if (onSuccess) onSuccess();
      else resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setRecipient('');
    setSubject('');
    setContent('');
  };

  const handleSend = () => {
    if (!recipient) {
      toast({
        title: 'Missing Information',
        description: 'Please select a recipient.',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a message.',
        variant: 'destructive',
      });
      return;
    }

    sendMessageMutation.mutate({
      recipientId: parseInt(recipient),
      subject: subject.trim() || undefined,
      body: content.trim(),
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">New Message</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 flex-1">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">To:</label>
            <Select 
              value={recipient} 
              onValueChange={(value) => setRecipient(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {isLoadingUsers ? (
                    <SelectItem value="loading" disabled>Loading users...</SelectItem>
                  ) : !users ? (
                    <SelectItem value="error" disabled>Failed to load users</SelectItem>
                  ) : users.length === 0 ? (
                    <SelectItem value="empty" disabled>No users available</SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.username}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Subject (Optional):</label>
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Message:</label>
            <Textarea
              placeholder="Type your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t flex justify-end">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={resetForm}
          >
            Clear
          </Button>
          <Button 
            onClick={handleSend}
            disabled={sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComposeMessage;
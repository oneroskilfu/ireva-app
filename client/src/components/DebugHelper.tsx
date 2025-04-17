import { Button } from '@/components/ui/button';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function DebugHelper() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDebugLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/debug-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store token in localStorage as auth_token to match the useAuth hook expectations
      localStorage.setItem('auth_token', data.token);
      
      // Set user data in React Query cache
      queryClient.setQueryData(["/api/user"], data.user);
      
      toast({
        title: 'Debug Login Successful',
        description: `Welcome ${data.user.username}! Refresh the page and try accessing protected routes now.`,
      });

      // Log success but don't redirect
      console.log('Debug login successful:', data.user);
      
    } catch (error) {
      console.error('Debug login error:', error);
      toast({
        title: 'Login failed',
        description: 'Could not log in. Check server logs.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={handleDebugLogin} 
        disabled={isLoading}
        variant="outline" 
        size="sm"
        className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
      >
        {isLoading ? 'Logging in...' : '🔑 Debug Login'}
      </Button>
    </div>
  );
}
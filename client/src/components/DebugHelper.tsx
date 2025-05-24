import { Button } from '@/components/ui/button';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export function DebugHelper() {
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();

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
        description: `Welcome ${data.user.username}! Use the quick links above to navigate.`,
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
  
  const handleLogout = () => {
    if (logoutMutation) {
      logoutMutation.mutate(undefined, {
        onSuccess: () => {
          localStorage.removeItem('auth_token');
          toast({
            title: 'Logged out',
            description: 'You have been logged out successfully.',
          });
        },
      });
    } else {
      // Fallback logout if mutation isn't available
      localStorage.removeItem('auth_token');
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {user && (
        <div className="flex flex-col items-end gap-1">
          <div 
            className="bg-white p-3 rounded-lg shadow-lg flex flex-col gap-2 border"
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            <div className="text-sm font-semibold mb-1 border-b pb-1">Admin Links:</div>
            <Link href="/admin" className="text-blue-600 hover:underline text-sm py-1">
              Admin Dashboard
            </Link>
            <Link href="/admin/projects" className="text-blue-600 hover:underline text-sm py-1">
              Admin Projects
            </Link>
            <Link href="/admin/kyc" className="text-blue-600 hover:underline text-sm py-1">
              Admin KYC
            </Link>
            
            <div className="text-sm font-semibold mt-3 mb-1 border-b pb-1">Investor Links:</div>
            <Link href="/investor" className="text-green-600 hover:underline text-sm py-1">
              Investor Dashboard
            </Link>
            <Link href="/investor/projects" className="text-green-600 hover:underline text-sm py-1">
              Browse Projects
            </Link>
            <Link href="/wallet" className="text-green-600 hover:underline text-sm py-1">
              Wallet
            </Link>
            
            <div className="text-xs text-gray-500 mt-3 border-t pt-1">
              Logged in as: <span className="font-semibold">{user.username}</span> ({user.role})
            </div>
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        {user && (
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            size="sm"
            className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
          >
            ↪️ Logout
          </Button>
        )}
        <Button 
          onClick={handleDebugLogin} 
          disabled={isLoading}
          variant="outline" 
          size="sm"
          className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
        >
          {isLoading ? 'Logging in...' : (user ? '🔄 Refresh Login' : '🔑 Debug Login')}
        </Button>
      </div>
    </div>
  );
}
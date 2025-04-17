import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DebugLoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
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
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({
        title: 'Login successful',
        description: `Welcome, ${data.user.username}!`,
      });
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        // Try the legacy admin route since we know it exists
        navigate('/admin');
        
        // Alternative admin routes to try if the above doesn't work:
        // navigate('/admin-new');
        // navigate('/admin/dashboard');
        
        console.log('Redirecting admin user:', data.user);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Debug login error:', error);
      toast({
        title: 'Login failed',
        description: 'Could not log in automatically. Check server logs.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Debug Login</CardTitle>
          <CardDescription>
            Use this page to automatically log in as the test user for debugging purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will log you in as <strong>testuser</strong> with admin privileges using a special debug endpoint.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleDebugLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Debug Login'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DebugLoginPage;
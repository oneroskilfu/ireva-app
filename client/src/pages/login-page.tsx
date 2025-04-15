import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import API from '@/api/axios';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BuildingIcon, LoaderCircleIcon } from 'lucide-react';

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Login page component
 */
const LoginPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await API.post('/login', data);
      
      // Store user data in localStorage
      const userData = response.data;
      
      if (userData) {
        // Convert isAdmin to role for consistency
        const userWithRole = {
          ...userData,
          role: userData.isAdmin ? 'admin' : 'investor'
        };
        
        // Store user data and create a dummy token since we're using session-based auth
        localStorage.setItem('user', JSON.stringify(userWithRole));
        localStorage.setItem('token', 'session-auth-token');
        
        // Redirect based on user role
        if (userData.isAdmin) {
          toast({
            title: 'Admin Login Successful',
            description: 'Welcome back, administrator!',
          });
          setLocation('/admin');
        } else {
          toast({
            title: 'Login Successful',
            description: 'Welcome back to iREVA!',
          });
          setLocation('/dashboard');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Form Section */}
      <div className="flex flex-col justify-center items-center p-6 lg:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <BuildingIcon className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to your iREVA account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your username" 
                        type="text" 
                        autoComplete="username"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </Button>
            </form>
          </Form>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/auth" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden lg:block bg-muted">
        <div className="h-full flex flex-col justify-center p-10 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="max-w-md mx-auto space-y-6">
            <h2 className="text-4xl font-bold tracking-tight">
              Invest in Nigerian Real Estate
            </h2>
            <p className="text-lg">
              Join thousands of investors building wealth through our curated property investments across Nigeria.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-background p-4 rounded-lg">
                <h3 className="font-semibold">20+ Properties</h3>
                <p className="text-sm text-muted-foreground">
                  Diverse investment options
                </p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <h3 className="font-semibold">12-20% ROI</h3>
                <p className="text-sm text-muted-foreground">
                  Competitive annual returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
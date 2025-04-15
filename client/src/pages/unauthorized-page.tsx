import React from 'react';
import { Link } from 'wouter';
import { LockIcon, HomeIcon, AlertTriangleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Unauthorized page displayed when a user tries to access a restricted route
 */
const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-lg mb-6 inline-block mx-auto">
          <LockIcon className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Access Denied
        </h1>
        
        <div className="bg-muted/50 p-4 rounded-md my-4 flex items-center">
          <AlertTriangleIcon className="text-amber-500 mr-3 h-5 w-5 flex-shrink-0" />
          <p className="text-muted-foreground text-sm">
            You don't have permission to view this page. This area is restricted to administrators only.
          </p>
        </div>
        
        <p className="text-muted-foreground">
          If you believe you should have access to this page, please contact the system administrator or verify your account credentials.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button variant="default" asChild>
            <Link href="/login" className="flex items-center gap-2">
              <LockIcon className="h-4 w-4" />
              Log In
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <HomeIcon className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert, Home, LogIn, AlertTriangle } from "lucide-react";

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="max-w-md w-full text-center p-6">
        <div className="flex justify-center mb-4">
          <div className="bg-destructive/10 p-3 rounded-full">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        
        <div className="bg-destructive/10 text-destructive font-medium py-2 px-4 rounded-md mb-4 flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>You don't have permission to access this page</span>
        </div>
        
        <p className="text-muted-foreground mb-6">
          {user 
            ? `Your current role (${user.role}) does not have sufficient privileges to view this page.`
            : "You need to be logged in with appropriate permissions to access this page."
          }
        </p>
        
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          
          {!user && (
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Home, LogOut } from "lucide-react";

export default function UnauthorizedPage() {
  const [, setLocation] = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLocation("/auth");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="rounded-full bg-muted p-6 mx-auto w-24 h-24 flex items-center justify-center">
          <Shield className="h-12 w-12 text-destructive" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
        
        <p className="text-muted-foreground">
          {user 
            ? `Sorry, your account (${user.role}) doesn't have permission to access this area.`
            : "You need to be logged in to access this area."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
          <Button 
            variant="default" 
            onClick={() => setLocation("/")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
          
          {user && (
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
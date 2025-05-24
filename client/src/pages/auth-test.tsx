import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { UserCircle, LogOut, LogIn, UserPlus, ShieldCheck, Home } from "lucide-react";

export default function AuthTestPage() {
  const { user, loginMutation, registerMutation, logoutMutation } = useAuth();

  const handleTestLogin = () => {
    loginMutation.mutate(
      { email: "admin@ireva.com", password: "password123" },
      {
        onSuccess: () => {
          console.log("Test login successful");
        },
      }
    );
  };

  const handleTestRegister = () => {
    registerMutation.mutate(
      {
        username: "testuser",
        email: "test@ireva.com",
        password: "password123",
        role: "investor",
      },
      {
        onSuccess: () => {
          console.log("Test registration successful");
        },
      }
    );
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Authentication Test Page</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/auth">
              <UserCircle className="mr-2 h-4 w-4" />
              Auth Page
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current User Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Current User Status
            </CardTitle>
            <CardDescription>
              Information about the currently authenticated user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <span className="text-green-600 font-semibold flex items-center">
                    <ShieldCheck className="mr-1 h-4 w-4" />
                    Authenticated
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">User ID:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{user.id}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Username:</span>
                  <span>{user.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Role:</span>
                  <span className="capitalize bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm">
                    {user.role || "None"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                <UserCircle className="h-12 w-12 mb-2 opacity-50" />
                <p>Not logged in</p>
                <p className="text-sm">Use the actions below to authenticate</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {user ? (
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            ) : (
              <Button asChild variant="default" className="w-full">
                <Link href="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Go to Login Page
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test Actions
            </CardTitle>
            <CardDescription>
              Quick actions to test authentication functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Test Login</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Attempt to login using test credentials
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={handleTestLogin}
                disabled={loginMutation.isPending}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {loginMutation.isPending ? "Logging in..." : "Login as Admin"}
              </Button>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Test Registration</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Attempt to register a new test user
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={handleTestRegister}
                disabled={registerMutation.isPending}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {registerMutation.isPending ? "Registering..." : "Register Test User"}
              </Button>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Protected Routes</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Try accessing protected routes based on roles
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/dashboard">
                    Admin Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/investor/dashboard">
                    Investor Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional info */}
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Authentication System Notes</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Protected Routes</h3>
            <p className="text-muted-foreground text-sm">
              Routes like <code>/admin/dashboard</code> are protected and will redirect to the login page if not authenticated.
              If authenticated but without proper role, you'll be redirected to an unauthorized page.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Authentication Flow</h3>
            <p className="text-muted-foreground text-sm">
              The system uses JWT tokens with role-based access control. Authentication state is persisted using HTTP-only cookies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const JwtTestPage = () => {
  const { toast } = useToast();
  const { loginMutation, token, user, logoutMutation } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [testResponse, setTestResponse] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ username, password });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setTestResponse(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const testJwtProtectedRoute = async () => {
    try {
      if (!token) {
        toast({
          title: "No Token",
          description: "Please login first to get a token",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch("/api/test-jwt", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTestResponse(data);
      
      toast({
        title: "Success!",
        description: "JWT authentication successful",
      });
    } catch (error) {
      console.error("API test error:", error);
      toast({
        title: "JWT Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">JWT Authentication Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>JWT Authentication</CardTitle>
            <CardDescription>
              Test JWT authentication by logging in and accessing a protected route
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div className="border p-4 rounded-md bg-muted">
                  <h3 className="font-medium">Logged in User:</h3>
                  <pre className="text-sm mt-2 overflow-auto max-h-40">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
                {token && (
                  <div className="border p-4 rounded-md bg-muted">
                    <h3 className="font-medium">JWT Token:</h3>
                    <div className="text-xs mt-2 break-all">
                      {token}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium">
                    Username
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {user ? (
              <Button variant="destructive" onClick={handleLogout} disabled={logoutMutation.isPending}>
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground">
                Login to test JWT authentication
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Test Card */}
        <Card>
          <CardHeader>
            <CardTitle>Protected Route Test</CardTitle>
            <CardDescription>
              Test accessing a JWT-protected API route
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testJwtProtectedRoute} 
              disabled={!token} 
              className="w-full"
            >
              Test Protected Route
            </Button>

            {testResponse && (
              <div className="mt-6 border p-4 rounded-md bg-muted">
                <h3 className="font-medium">API Response:</h3>
                <pre className="text-sm mt-2 overflow-auto max-h-60">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              {token ? 
                "Click the button to test JWT authentication" : 
                "Please login first to get a token"}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default JwtTestPage;
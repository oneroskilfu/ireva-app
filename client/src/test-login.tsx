import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Test component for login functionality
 * This is a minimal implementation to test just the login flow independently
 */
export default function TestLogin() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Make login request
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token
      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUserData(data.user);

      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });

      console.log("Login successful", data);
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetUserInfo = async () => {
    try {
      const response = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user info");
      }

      setUserData(data);
      console.log("User data:", data);

      toast({
        title: "User info retrieved",
        description: "Successfully fetched user information",
      });
    } catch (error: any) {
      console.error("Error fetching user:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUserData(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Login Test Page</h1>

        {!token ? (
          <Card>
            <CardHeader>
              <CardTitle>Login Test</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Logged In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-medium mb-2">Token:</h3>
                <div className="text-xs overflow-auto break-all max-h-20">
                  {token}
                </div>
              </div>

              {userData && (
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="font-medium mb-2">User Data:</h3>
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex space-x-2">
                <Button onClick={handleGetUserInfo} className="flex-1">
                  Get User Info
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="flex-1"
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
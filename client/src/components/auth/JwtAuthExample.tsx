import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, LogOut, RefreshCw } from "lucide-react";
import axios from 'axios';

const JwtAuthExample = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const fetchUserData = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUserData(response.data);
      setSuccess('Successfully retrieved user data');
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.response?.data?.message || 'Failed to fetch user data');
      
      // If the token is invalid, clear it
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      setToken(token);
      setUserData(user);
      setSuccess('Login successful!');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUserData(null);
    setSuccess('Logged out successfully');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>JWT Authentication Example</CardTitle>
        <CardDescription>
          Test the JWT authentication with your API
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {!token ? (
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">User Information</h3>
              <div className="rounded-md bg-slate-50 p-4 mt-2">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Username:</span>
                    <span className="text-sm">{userData?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{userData?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Role:</span>
                    <Badge variant="outline">{userData?.role}</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium">Token</h3>
              <textarea 
                className="w-full p-2 text-xs bg-slate-100 border rounded mt-2" 
                rows={3} 
                readOnly 
                value={token || ''}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={fetchUserData} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  'Refresh Data'
                )}
              </Button>
              
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start px-6 py-4 bg-slate-50 text-sm text-slate-600">
        <p>Testing JWT authentication flow for the REVA application.</p>
        <p className="mt-1">
          Default admin: <code>admin</code> / <code>password</code>
        </p>
      </CardFooter>
    </Card>
  );
};

export default JwtAuthExample;
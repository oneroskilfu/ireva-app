import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Types for JWT authentication response
type AuthResponse = {
  user: SelectUser;
  token: string;
};

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  token: string | null;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthResponse, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

// Helper functions for token management
const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Get initial token from localStorage
  const initialToken = getAuthToken();
  
  // Query to fetch current user data using JWT token
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ 
      on401: "returnNull",
      headers: initialToken ? { Authorization: `Bearer ${initialToken}` } : undefined
    }),
    enabled: !!initialToken, // Only run query if token exists
  });

  // Login mutation
  const loginMutation = useMutation<AuthResponse, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await res.json();
      if (!data.token) {
        throw new Error("No token received from server");
      }
      return data;
    },
    onSuccess: (data) => {
      // Store JWT token in localStorage
      setAuthToken(data.token);
      
      // Update the query cache with user data
      queryClient.setQueryData(["/api/user"], data.user);
      
      // Show success message
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      // Redirect based on user role
      if (data.user.role === 'admin' || data.user.role === 'super_admin') {
        console.log('Admin user detected, redirecting to admin dashboard');
        navigate("/admin-new"); // Using the new route path
      } else {
        console.log('Regular user detected, redirecting to investor dashboard');
        navigate("/investor"); // Using the new route path for investors
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Registration mutation
  const registerMutation = useMutation<AuthResponse, Error, InsertUser>({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      const data = await res.json();
      if (!data.token) {
        throw new Error("No token received from server");
      }
      return data;
    },
    onSuccess: (data) => {
      // Store JWT token in localStorage
      setAuthToken(data.token);
      
      // Update the query cache with user data
      queryClient.setQueryData(["/api/user"], data.user);
      
      toast({
        title: "Account created",
        description: "Your account has been successfully created.",
      });
      
      // Redirect based on user role
      if (data.user.role === 'admin' || data.user.role === 'super_admin') {
        console.log('Admin user registered, redirecting to admin dashboard');
        navigate("/admin-new"); // Using the new route path
      } else {
        console.log('Regular user registered, redirecting to investor dashboard');
        navigate("/investor"); // Using the new route path for investors
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // If using server-side logout
      try {
        await apiRequest("POST", "/api/auth/logout", {}, {
          headers: initialToken ? { Authorization: `Bearer ${initialToken}` } : undefined
        });
      } catch (err) {
        console.error("Error during server logout:", err);
        // Continue with client-side logout even if server logout fails
      }
      
      // Client-side logout
      removeAuthToken();
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Redirect to home page after logout
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      // Even if there's an error, we should still remove the token
      removeAuthToken();
    },
  });

  // Effect to handle token expiration or invalidation
  useEffect(() => {
    // If we have a token but no user data, the token might be invalid
    if (initialToken && !isLoading && !user && !error) {
      console.log("Token exists but no user data found. Token might be invalid.");
      removeAuthToken();
    }
  }, [initialToken, isLoading, user, error]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        token: initialToken,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

// Types
export type UserRole = "admin" | "investor";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  fullName?: string;
  verified?: boolean;
  profileImage?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// JWT token management
const getToken = () => localStorage.getItem("token");
const setToken = (token: string) => localStorage.setItem("token", token);
const removeToken = () => localStorage.removeItem("token");

// Create a custom axios instance for API requests
const api = axios.create({
  baseURL: "/api",
});

// Add an interceptor to include the JWT token in all requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for auto-login on app startup
  const { data: autoLoginData, isLoading: autoLoginLoading } = useQuery({
    queryKey: ["auth", "verify"],
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        return null;
      }
      try {
        const response = await api.get("/auth/verify");
        return response.data.user;
      } catch (err) {
        // Don't show an error message for auth verification failures
        console.log("Auto-login failed or token expired");
        removeToken();
        return null;
      }
    },
    retry: false,
  });

  // Update user state when auto-login completes
  useEffect(() => {
    if (!autoLoginLoading) {
      setUser(autoLoginData || null);
      setIsLoading(false);
    }
  }, [autoLoginData, autoLoginLoading]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["auth", "verify"] });
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });
      setLocation("/");
    },
    onError: (err: Error) => {
      setError(err);
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post("/auth/register", data);
      return response.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["auth", "verify"] });
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.user.username}!`,
      });
      setLocation("/");
    },
    onError: (err: Error) => {
      setError(err);
      toast({
        title: "Registration failed",
        description: "This email might already be in use",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Server logout is just a formality for analytics since JWT is stateless
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      removeToken();
      setUser(null);
      queryClient.invalidateQueries();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/auth");
    },
    onError: (err: Error) => {
      setError(err);
      // Even if server logout fails, we still want to clear local state
      removeToken();
      setUser(null);
      queryClient.invalidateQueries();
      toast({
        title: "Logout failed",
        description: "But you've been logged out locally",
      });
      setLocation("/auth");
    },
  });

  // Token refresh interval
  useEffect(() => {
    if (!user) return;

    const refreshToken = async () => {
      try {
        const response = await api.post("/auth/refresh");
        if (response.data.token) {
          setToken(response.data.token);
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    };

    // Check token every 10 minutes
    const interval = setInterval(refreshToken, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Auth context value
  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isAuthenticated: !!user,
    hasRole: (role: UserRole | UserRole[]) => {
      if (!user) return false;
      return Array.isArray(role)
        ? role.includes(user.role)
        : user.role === role;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper functions for external use
export function getCurrentUser(): User | null {
  const context = useContext(AuthContext);
  return context?.user || null;
}

export function getUserRole(): UserRole | null {
  const user = getCurrentUser();
  return user?.role || null;
}

export function hasRole(role: UserRole | UserRole[]): boolean {
  const context = useContext(AuthContext);
  if (!context?.user) return false;
  
  return Array.isArray(role)
    ? role.includes(context.user.role)
    : context.user.role === role;
}
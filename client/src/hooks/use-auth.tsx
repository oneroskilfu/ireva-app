import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/**
 * Represents the payload data for JWT tokens
 * Contains essential user information for authentication and authorization
 */
export interface UserPayload {
  id: string;
  email: string;
  username: string;
  role: "admin" | "investor" | "super_admin" | null;
  createdAt?: Date;
}

// API request utility
async function apiRequest(
  method: string,
  endpoint: string,
  data?: any
): Promise<Response> {
  return fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
}

// Helper function to handle the query
const getQueryFn = (options?: { 
  on401?: "throw" | "returnNull" 
}) => async ({ queryKey }: any): Promise<UserPayload | null> => {
  const [url] = queryKey;
  const response = await fetch(url, {
    credentials: "include",
  });

  if (response.status === 401) {
    if (options?.on401 === "returnNull") {
      return null;
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error("An error occurred while fetching data");
  }

  return response.json();
};

// Types for the authentication context
type AuthContextType = {
  user: UserPayload | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<UserPayload, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<UserPayload, Error, RegisterData>;
};

// Types for login and registration data
type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  role: "admin" | "investor" | "super_admin" | null;
};

// Create the authentication context
export const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Query to get the current user data
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async ({ queryKey }) => {
      const [url] = queryKey;
      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new Error("An error occurred while fetching data");
      }

      return await response.json() as UserPayload;
    },
    retry: false,
  });

  // Mutation for login
  const loginMutation = useMutation<UserPayload, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      try {
        // Map email to username for server compatibility
        const serverCredentials = {
          username: credentials.email,
          password: credentials.password
        };
        
        const res = await apiRequest("POST", "/api/login", serverCredentials);
        
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Invalid username or password");
          }
          const error = await res.text();
          throw new Error(error || "Login failed");
        }
        
        return await res.json();
      } catch (error) {
        console.error("Login error:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unexpected error occurred during login");
      }
    },
    onSuccess: () => {
      refetch(); // Refresh user data after login
      toast({
        title: "Login successful",
        description: "Welcome to the iREVA platform",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for registration
  const registerMutation = useMutation<UserPayload, Error, RegisterData>({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role || "investor"
      });
      
      if (!res.ok) {
        let errorMsg;
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || "Registration failed";
        } catch {
          errorMsg = "Registration failed";
        }
        throw new Error(errorMsg);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      refetch(); // Refresh user data after registration
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for logout
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      
      if (!res.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      // Clear user data after logout
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
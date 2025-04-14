import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient, setAuthToken, removeAuthToken } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, signInWithFacebook } from "@/lib/firebase";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  socialLoginMutation: UseMutationResult<SelectUser, Error, SocialLoginData>;
  isFirebaseAvailable: boolean;
};

type LoginData = Pick<InsertUser, "username" | "password">;

type SocialLoginData = {
  provider: "google" | "facebook";
  token: string;
  userData: {
    email: string;
    name?: string;
    photoURL?: string;
  };
};

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Check if Firebase is properly configured
  const isFirebaseAvailable = Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY && 
    import.meta.env.VITE_FIREBASE_APP_ID &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      const data = await res.json();
      // Store the JWT token if present in response
      if (data.token) {
        setAuthToken(data.token);
      }
      return data;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    },
    onError: (error: Error) => {
      // Clear any existing token on login error
      removeAuthToken();
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      const data = await res.json();
      // Store the JWT token if present in response
      if (data.token) {
        setAuthToken(data.token);
      }
      return data;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Account created",
        description: "Your account has been successfully created.",
      });
    },
    onError: (error: Error) => {
      // Clear any existing token on registration error
      removeAuthToken();
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      // Remove the JWT token on logout
      removeAuthToken();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      // Still remove token on error as a precaution 
      // (avoids staying in a logged-in state with an invalid token)
      removeAuthToken();
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const socialLoginMutation = useMutation({
    mutationFn: async (socialData: SocialLoginData) => {
      const res = await apiRequest("POST", "/api/social-login", socialData);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with social account.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Social login failed",
        description: error.message || "Could not sign in with social account. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        socialLoginMutation,
        isFirebaseAvailable,
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
  
  // Helper functions to handle social login
  const handleGoogleLogin = async () => {
    if (!context.isFirebaseAvailable) {
      context.socialLoginMutation.reset();
      throw new Error("Firebase is not properly configured. Please check your environment variables.");
    }
    
    try {
      const result = await signInWithGoogle();
      if (!result) return;
      
      // Get token and user info from the Firebase response
      const token = result.user.accessToken;
      const userData = {
        email: result.user.email || "",
        name: result.user.displayName || "",
        photoURL: result.user.photoURL || "",
      };
      
      // Call the socialLoginMutation with the obtained data
      context.socialLoginMutation.mutate({
        provider: "google",
        token,
        userData,
      });
      
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };
  
  const handleFacebookLogin = async () => {
    if (!context.isFirebaseAvailable) {
      context.socialLoginMutation.reset();
      throw new Error("Firebase is not properly configured. Please check your environment variables.");
    }
    
    try {
      const result = await signInWithFacebook();
      if (!result) return;
      
      // Get token and user info from the Firebase response
      const token = result.user.accessToken;
      const userData = {
        email: result.user.email || "",
        name: result.user.displayName || "",
        photoURL: result.user.photoURL || "",
      };
      
      // Call the socialLoginMutation with the obtained data
      context.socialLoginMutation.mutate({
        provider: "facebook",
        token,
        userData,
      });
      
    } catch (error) {
      console.error("Facebook sign in error:", error);
    }
  };
  
  return {
    ...context,
    handleGoogleLogin,
    handleFacebookLogin,
  };
}

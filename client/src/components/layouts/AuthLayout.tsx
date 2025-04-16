import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin" || user.role === "super_admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/investor/dashboard");
      }
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Only render the auth page if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden">
          {children}
        </div>
      </div>
    );
  }
  
  // This shouldn't be visible due to the redirect, but as a fallback
  return null;
};

export default AuthLayout;
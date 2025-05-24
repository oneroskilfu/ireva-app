import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Redirect if already logged in
  if (user) {
    if (user.role === "admin" || user.role === "super_admin") {
      navigate("/admin");
    } else {
      navigate("/investor");
    }
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eafffd] to-[#dafbf7] p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
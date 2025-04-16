import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Info, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

// Extended schemas with validation
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(11, "Phone number must be at least 11 digits"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });
  
  const onLoginSubmit = (data: LoginFormValues) => {
    // The redirect is handled in the useAuth hook 
    loginMutation.mutate(data);
  };
  
  const onRegisterSubmit = (data: RegisterFormValues) => {
    // The redirect is handled in the useAuth hook
    registerMutation.mutate(data);
  };
  
  // Redirect if already logged in - based on role
  if (user) {
    if (user.role === "admin" || user.role === "super_admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eafffd] to-[#dafbf7] p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Login Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12">
            <div className="mb-8 flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#16b5a0] text-white flex items-center justify-center mr-2">
                <Info className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-gray-800">iREVA</span>
            </div>
            
            {activeTab === "login" ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <div className="space-y-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        placeholder="Petter@gmail.com"
                        className="pl-10 py-6 rounded-xl border-gray-200"
                        {...loginForm.register("username")}
                      />
                    </div>
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="password"
                        placeholder="Password"
                        className="pl-10 py-6 rounded-xl border-gray-200"
                        {...loginForm.register("password")}
                      />
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember-me" 
                        {...loginForm.register("rememberMe")}
                      />
                      <label htmlFor="remember-me" className="text-sm text-gray-600">
                        Remember Password
                      </label>
                    </div>
                    <a href="#" className="text-sm text-[#16b5a0] hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full py-6 bg-[#0c1b46] hover:bg-[#19307a] text-white rounded-xl"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : "Login"}
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    No account yet?{" "}
                    <button 
                      type="button"
                      className="text-[#16b5a0] hover:underline font-medium"
                      onClick={() => setActiveTab("register")}
                    >
                      Register
                    </button>
                  </div>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or Login with</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      type="button"
                      className="flex justify-center items-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.917 16.083c-2.258 0-4.083-1.825-4.083-4.083s1.825-4.083 4.083-4.083c1.103 0 2.024.402 2.735 1.067l-1.107 1.068c-.304-.292-.834-.63-1.628-.63-1.394 0-2.531 1.155-2.531 2.579 0 1.424 1.138 2.579 2.531 2.579 1.616 0 2.224-1.162 2.316-1.762h-2.316v-1.4h3.855c.036.204.064.408.064.677.001 2.332-1.563 3.988-3.919 3.988zm9.917-3.5h-1.75v1.75h-1.167v-1.75h-1.75v-1.166h1.75v-1.75h1.167v1.75h1.75v1.166z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="flex justify-center items-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="flex justify-center items-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4267B2]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="flex justify-center items-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                        <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                        <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                        <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
                      </svg>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create an account</h2>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Input
                        type="text"
                        placeholder="First Name"
                        className="py-6 rounded-xl border-gray-200"
                        {...registerForm.register("firstName")}
                      />
                      {registerForm.formState.errors.firstName && (
                        <p className="text-sm text-red-500">
                          {registerForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <Input
                        type="text"
                        placeholder="Last Name"
                        className="py-6 rounded-xl border-gray-200"
                        {...registerForm.register("lastName")}
                      />
                      {registerForm.formState.errors.lastName && (
                        <p className="text-sm text-red-500">
                          {registerForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <Input
                        type="email"
                        placeholder="Email"
                        className="pl-10 py-6 rounded-xl border-gray-200"
                        {...registerForm.register("email")}
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <Input
                        type="tel"
                        placeholder="Phone Number (e.g., 08012345678)"
                        className="pl-10 py-6 rounded-xl border-gray-200"
                        {...registerForm.register("phoneNumber")}
                      />
                    </div>
                    {registerForm.formState.errors.phoneNumber && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        placeholder="Username"
                        className="pl-10 py-6 rounded-xl border-gray-200"
                        {...registerForm.register("username")}
                      />
                    </div>
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="password"
                        placeholder="Password"
                        className="pl-10 py-6 rounded-xl border-gray-200"
                        {...registerForm.register("password")}
                      />
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full py-6 bg-[#0c1b46] hover:bg-[#19307a] text-white rounded-xl"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : "Register"}
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <button 
                      type="button"
                      className="text-[#16b5a0] hover:underline font-medium"
                      onClick={() => setActiveTab("login")}
                    >
                      Login
                    </button>
                  </div>
                  
                  {/* Mobile App Download Section */}
                  <div className="mt-8 space-y-4">
                    <div className="text-center">
                      <h3 className="text-sm font-medium">Download iOS and Android apps</h3>
                      <p className="text-xs text-gray-500 mt-1">Track investments and manage your portfolio on the go</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button 
                        variant="outline"
                        className="bg-black text-white hover:bg-black/90 border-0 h-12 flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                        </svg>
                        <div className="flex flex-col items-start">
                          <span className="text-xs">Download on the</span>
                          <span className="text-sm font-semibold">App Store</span>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="bg-black text-white hover:bg-black/90 border-0 h-12 flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.61 15.15C16.15 15.15 15.77 14.78 15.77 14.32V10.22C15.77 9.76 16.15 9.39 16.61 9.39C17.07 9.39 17.45 9.76 17.45 10.22V14.32C17.45 14.78 17.07 15.15 16.61 15.15M7.41 15.15C6.95 15.15 6.57 14.78 6.57 14.32V10.22C6.57 9.76 6.95 9.39 7.41 9.39C7.87 9.39 8.24 9.76 8.24 10.22V14.32C8.24 14.78 7.87 15.15 7.41 15.15M12 17.67C9.3 17.67 7.06 17.16 7.06 16.5V18.67H16.94V16.5C16.94 17.16 14.7 17.67 12 17.67M12 6.67C8.45 6.67 5.54 9.58 5.54 13.13C5.54 13.91 5.71 14.66 6 15.33V16.5C6 16.28 6.22 16.04 6.57 15.84C7.46 15.31 9.6 14.93 12 14.93C14.4 14.93 16.54 15.31 17.43 15.84C17.78 16.04 18 16.28 18 16.5V15.33C18.3 14.66 18.46 13.91 18.46 13.13C18.46 9.58 15.55 6.67 12 6.67M12 8.14C14.67 8.14 16.8 10.27 16.8 12.94C16.8 15.61 14.67 17.74 12 17.74C9.33 17.74 7.2 15.61 7.2 12.94C7.2 10.27 9.33 8.14 12 8.14Z" />
                        </svg>
                        <div className="flex flex-col items-start">
                          <span className="text-xs">GET IT ON</span>
                          <span className="text-sm font-semibold">Google Play</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
          
          {/* Right side - Investment Opportunity Content */}
          <div className="hidden md:block md:w-1/2 bg-white p-12">
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-[#0c1b46] mb-3">Invest in Premium Real Estate</h2>
                  <p className="text-gray-600">Access diverse investment opportunities across Nigeria</p>
                </div>
                
                {/* Property Investment Illustration */}
                <div className="w-full h-60 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl mb-8 overflow-hidden relative">
                  <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4">
                    <div className="bg-white rounded-lg shadow-sm p-2 flex flex-col justify-between transform hover:scale-105 transition-transform">
                      <div className="h-16 bg-blue-100 rounded-md mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
                      <div className="mt-2 bg-[#16b5a0] text-white text-xs rounded py-1 px-2 text-center">₦100,000+</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-2 flex flex-col justify-between transform hover:scale-105 transition-transform">
                      <div className="h-16 bg-teal-100 rounded-md mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
                      <div className="mt-2 bg-[#0c1b46] text-white text-xs rounded py-1 px-2 text-center">₦500,000+</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-2 flex flex-col justify-between transform hover:scale-105 transition-transform">
                      <div className="h-16 bg-indigo-100 rounded-md mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
                      <div className="mt-2 bg-gray-800 text-white text-xs rounded py-1 px-2 text-center">₦1,000,000+</div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full space-y-4">
                  <div className="p-5 rounded-xl bg-gradient-to-br from-[#f8fdfc] to-[#eafffb] border border-[#e0f5f2] shadow-sm">
                    <h3 className="text-lg font-bold text-[#0c1b46] mb-2">Tiered Investment Opportunities</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-[#16b5a0] flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-700">Start with as little as ₦100,000</p>
                      </li>
                      <li className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-[#16b5a0] flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-700">Real-time investment tracking</p>
                      </li>
                      <li className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-[#16b5a0] flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-700">Secure investment process</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

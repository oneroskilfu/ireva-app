import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MFAVerification } from "@/components/auth/MFAVerification";

// Extended schemas with validation
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showMFAVerification, setShowMFAVerification] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<string>("app");
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
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
    },
  });
  
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: (user) => {
        // For testing purposes, always show MFA verification
        // In a real application, this would check user.mfaEnabled
        setMfaMethod("app"); // Default to app for testing
        setShowMFAVerification(true);
        toast({
          title: "MFA Required",
          description: "For security purposes, please complete multi-factor authentication.",
        });
      },
    });
  };
  
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };
  
  const handleMFAVerified = () => {
    setShowMFAVerification(false);
    navigate("/");
  };
  
  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }
  
  // Show MFA verification when needed
  if (showMFAVerification) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="max-w-md w-full mx-auto px-4">
            <MFAVerification 
              mfaMethod={mfaMethod} 
              onVerified={handleMFAVerified} 
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row overflow-hidden bg-white rounded-xl shadow-lg">
            {/* Left side - Auth forms */}
            <div className="w-full lg:w-1/2 p-6 sm:p-10">
              <div className="flex items-center mb-6">
                <Building className="h-6 w-6 text-primary mr-2" />
                <span className="text-xl font-bold">REVA</span>
              </div>
              
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>Welcome back</CardTitle>
                      <CardDescription>
                        Sign in to your account to manage your real estate investments
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-username">Username</Label>
                          <Input
                            id="login-username"
                            type="text"
                            {...loginForm.register("username")}
                          />
                          {loginForm.formState.errors.username && (
                            <p className="text-sm text-red-500">
                              {loginForm.formState.errors.username.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="login-password">Password</Label>
                            <a href="#" className="text-sm text-primary hover:underline">
                              Forgot password?
                            </a>
                          </div>
                          <Input
                            id="login-password"
                            type="password"
                            {...loginForm.register("password")}
                          />
                          {loginForm.formState.errors.password && (
                            <p className="text-sm text-red-500">
                              {loginForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : "Create"}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>
                
                {/* Register Form */}
                <TabsContent value="register">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create an account</CardTitle>
                      <CardDescription>
                        Join thousands of investors and start your real estate investing journey
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="register-firstName">First Name</Label>
                            <Input
                              id="register-firstName"
                              type="text"
                              {...registerForm.register("firstName")}
                            />
                            {registerForm.formState.errors.firstName && (
                              <p className="text-sm text-red-500">
                                {registerForm.formState.errors.firstName.message}
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="register-lastName">Last Name</Label>
                            <Input
                              id="register-lastName"
                              type="text"
                              {...registerForm.register("lastName")}
                            />
                            {registerForm.formState.errors.lastName && (
                              <p className="text-sm text-red-500">
                                {registerForm.formState.errors.lastName.message}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="register-email">Email</Label>
                          <Input
                            id="register-email"
                            type="email"
                            {...registerForm.register("email")}
                          />
                          {registerForm.formState.errors.email && (
                            <p className="text-sm text-red-500">
                              {registerForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="register-username">Username</Label>
                          <Input
                            id="register-username"
                            type="text"
                            {...registerForm.register("username")}
                          />
                          {registerForm.formState.errors.username && (
                            <p className="text-sm text-red-500">
                              {registerForm.formState.errors.username.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="register-password">Password</Label>
                          <Input
                            id="register-password"
                            type="password"
                            {...registerForm.register("password")}
                          />
                          {registerForm.formState.errors.password && (
                            <p className="text-sm text-red-500">
                              {registerForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : "Create account"}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right side - Hero section */}
            <div className="hidden lg:block lg:w-1/2 bg-primary-dark p-10 text-white">
              <div className="h-full flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-4">
                  Real Estate Investing, Simplified
                </h2>
                <p className="text-lg mb-8 text-gray-200">
                  Access institutional-quality real estate investments with as little as $1,000. Build a diversified portfolio of income-generating properties without the hassle of traditional real estate ownership.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="rounded-full p-2 bg-white/10 mr-4">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">Low Minimum Investment</h3>
                      <p className="text-gray-300">Start investing with just $1,000</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="rounded-full p-2 bg-white/10 mr-4">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">Passive Income</h3>
                      <p className="text-gray-300">Earn monthly distributions from your investments</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="rounded-full p-2 bg-white/10 mr-4">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">Fully Transparent</h3>
                      <p className="text-gray-300">See exactly where your money is invested</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, ArrowRight, ShieldCheck, Users, DollarSign } from "lucide-react";

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

// Registration form validation schema
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  confirmPassword: z.string(),
  role: z.enum(["investor", "admin"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Redirect to home if user is already logged in
  if (user) {
    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user.role === "investor") {
      navigate("/investor/dashboard");
    } else {
      navigate("/");
    }
    return null;
  }

  // Login form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form setup
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "investor",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });

  // Login form submission handler
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: (userData) => {
        toast({
          title: "Login successful",
          description: "You have been logged in successfully",
        });
        
        // Redirect based on user role
        if (userData.role === "admin" || userData.role === "super_admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/investor/dashboard");
        }
      },
      onError: (error) => {
        toast({
          title: "Login failed",
          description: error.message || "An error occurred during login",
          variant: "destructive",
        });
      },
    });
  };

  // Register form submission handler
  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData, {
      onSuccess: (userData) => {
        toast({
          title: "Registration successful",
          description: "Your account has been created successfully",
        });
        
        // Redirect based on user role
        if (userData.role === "admin" || userData.role === "super_admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/investor/dashboard");
        }
      },
      onError: (error) => {
        toast({
          title: "Registration failed",
          description: error.message || "An error occurred during registration",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left column with authentication forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Welcome to iREVA</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <div className="grid grid-cols-2 gap-4 mt-1">
                            <Button
                              type="button"
                              variant={field.value === "investor" ? "default" : "outline"}
                              className="flex items-center justify-center gap-2"
                              onClick={() => registerForm.setValue("role", "investor")}
                            >
                              <DollarSign className="h-4 w-4" />
                              Investor
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "admin" ? "default" : "outline"}
                              className="flex items-center justify-center gap-2"
                              onClick={() => registerForm.setValue("role", "admin")}
                            >
                              <Building className="h-4 w-4" />
                              Admin
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            {activeTab === "login" ? (
              <p>Don't have an account? <Button variant="link" onClick={() => setActiveTab("register")} className="p-0 h-auto">Register</Button></p>
            ) : (
              <p>Already have an account? <Button variant="link" onClick={() => setActiveTab("login")} className="p-0 h-auto">Login</Button></p>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Right column with platform info */}
      <div className="hidden lg:block lg:w-1/2 bg-primary text-primary-foreground">
        <div className="h-full flex flex-col justify-center p-8 lg:p-12">
          <div className="max-w-lg mx-auto">
            <h1 className="text-4xl font-bold mb-6">
              iREVA Real Estate Investment Platform
            </h1>
            <p className="text-xl mb-12">
              The most advanced platform for real estate investment, bringing together investors and property managers.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary-foreground/10 p-3 rounded-full">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Secure Investment</h3>
                  <p>All transactions are protected with advanced security measures and full transparency.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary-foreground/10 p-3 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
                  <p>Different roles for investors and administrators with appropriate permissions and dashboards.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary-foreground/10 p-3 rounded-full">
                  <ArrowRight className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Get Started Now</h3>
                  <p>Create your account in minutes and start exploring investment opportunities right away.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
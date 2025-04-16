import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/layouts/AuthLayout";
import { loginFormSchema, registrationFormSchema } from "@/shared/validators/formValidators";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Info, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type LoginFormValues = z.infer<typeof loginFormSchema>;
type RegisterFormValues = z.infer<typeof registrationFormSchema>;

export default function LoginRegisterPage() {
  const { toast } = useToast();
  const { loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      agreeToTerms: false,
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
  
  return (
    <AuthLayout>
      <div className="flex flex-col md:flex-row">
        {/* Left side - Login/Register Form */}
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
                      placeholder="Username or Email"
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
                
                <div className="space-y-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      className="pl-10 py-6 rounded-xl border-gray-200"
                      {...registerForm.register("confirmPassword")}
                    />
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    {...registerForm.register("agreeToTerms")}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the <a href="#" className="text-[#16b5a0] hover:underline">Terms of Service</a> and <a href="#" className="text-[#16b5a0] hover:underline">Privacy Policy</a>
                  </label>
                </div>
                {registerForm.formState.errors.agreeToTerms && (
                  <p className="text-sm text-red-500">
                    {registerForm.formState.errors.agreeToTerms.message}
                  </p>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full py-6 bg-[#0c1b46] hover:bg-[#19307a] text-white rounded-xl"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : "Create Account"}
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
              </form>
            </>
          )}
        </div>
        
        {/* Right side - Hero Section */}
        <div className="hidden md:block md:w-1/2 bg-[#0c1b46] text-white p-12">
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-6">
              Africa's Premier Real Estate Investment Platform
            </h2>
            <p className="text-lg mb-8 text-gray-300">
              Join thousands of investors unlocking the power of real estate in Africa's fastest-growing markets.
            </p>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#16b5a0] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Access Premium Properties</h3>
                  <p className="text-gray-300">Exclusive access to high-yield investment opportunities across Nigeria, Ghana, and Kenya.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#16b5a0] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Transparent Investments</h3>
                  <p className="text-gray-300">Full transparency with detailed analytics, documentation, and real-time ROI tracking.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#16b5a0] flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Secure Platform</h3>
                  <p className="text-gray-300">Advanced security, mobile verification, and investor protection measures.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
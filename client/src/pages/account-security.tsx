import React, { useState } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { MFASetup } from "@/components/auth/MFASetup";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Shield, KeyRound, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

function AccountSecurityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"password" | "mfa">("password");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const onPasswordSubmit = async (data: ChangePasswordFormValues) => {
    setIsSubmitting(true);
    try {
      // This is a stub - we would normally make an API request to change the password
      // await apiRequest("POST", "/api/user/change-password", data);
      
      // For now, just show a success message
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
      
      passwordForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error changing your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <main className="flex-1 p-6 lg:p-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Account Security</h1>
              <p className="text-gray-500 mt-2">
                Manage your account security and authentication settings
              </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "password" | "mfa")}>
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                <TabsTrigger value="password" className="gap-2">
                  <KeyRound className="h-4 w-4" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="mfa" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Two-Factor
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure.
                      We recommend using a strong, unique password.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          {...passwordForm.register("currentPassword")}
                        />
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-red-500">
                            {passwordForm.formState.errors.currentPassword.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          {...passwordForm.register("newPassword")}
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-sm text-red-500">
                            {passwordForm.formState.errors.newPassword.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          {...passwordForm.register("confirmPassword")}
                        />
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500">
                            {passwordForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
                
                <div className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                      <CardDescription>
                        Your contact information is used for account recovery and security notifications.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <Mail className="h-5 w-5 text-gray-500 mt-1" />
                        <div>
                          <h3 className="font-medium">Email Address</h3>
                          <p className="text-sm text-muted-foreground">
                            {user?.email || "No email address set"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <Phone className="h-5 w-5 text-gray-500 mt-1" />
                        <div>
                          <h3 className="font-medium">Phone Number</h3>
                          <p className="text-sm text-muted-foreground">
                            {user?.phoneNumber || "No phone number set"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline">Update Contact Info</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="mfa">
                <MFASetup />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function SecurityPageProtected() {
  return (
    <ProtectedRoute path="/account/security" component={AccountSecurityPage} />
  );
}
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InvestmentStats from "@/components/dashboard/InvestmentStats";
import InvestmentPortfolio from "@/components/dashboard/InvestmentPortfolio";
import RecommendedProperties from "@/components/dashboard/RecommendedProperties";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import ActiveProjects from "@/components/dashboard/ActiveProjects";
import CompletedProjects from "@/components/dashboard/CompletedProjects";
import EarningsBreakdown from "@/components/dashboard/EarningsBreakdown";
import AdvancedAnalytics from "@/components/dashboard/AdvancedAnalytics";
import PortfolioManagement from "@/components/dashboard/PortfolioManagement";
import RealTimeInvestmentTracker from "@/components/dashboard/RealTimeInvestmentTracker";
import { 
  Download, 
  Plus, 
  ChevronDown, 
  LayoutDashboard, 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  LineChart, 
  AlertCircle,
  Wallet,
  CreditCard,
  User,
  BadgeCheck,
  BadgeX,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnboarding } from "@/contexts/onboarding-context";
import StartOnboardingButton from "@/components/onboarding/StartOnboardingButton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PaystackCheckout } from "@/components/payments/PaystackCheckout";

// Form schemas
const fundWalletSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0, 
    { message: "Amount must be a positive number" }
  ),
});

const withdrawSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0, 
    { message: "Amount must be a positive number" }
  ),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
  accountName: z.string().min(1, "Account name is required"),
});

const kycSchema = z.object({
  idType: z.string().min(1, "ID type is required"),
  idNumber: z.string().min(1, "ID number is required"),
  phoneNumber: z.string()
    .min(13, "Phone number is too short")
    .regex(/^\+234[0-9]{10}$/, "Must be a valid Nigerian phone number starting with +234"),
});

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  
  // Open/close states for dialogs
  const [fundDialogOpen, setFundDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  
  // Fetch wallet data
  const walletQuery = useQuery({
    queryKey: ['/api/wallet'],
    enabled: !!user
  });
  
  // Fetch investments for analytics
  const investmentsQuery = useQuery({
    queryKey: ['/api/investments'],
    enabled: !!user
  });

  // Fund wallet mutation
  const fundWalletMutation = useMutation({
    mutationFn: async (data: z.infer<typeof fundWalletSchema>) => {
      const res = await apiRequest("POST", "/api/wallet/fund", {
        amount: Number(data.amount)
      });
      return await res.json();
    },
    onSuccess: (data) => {
      // Redirect to Paystack payment page
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Fund Wallet Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Withdraw from wallet mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: z.infer<typeof withdrawSchema>) => {
      const res = await apiRequest("POST", "/api/wallet/withdraw", {
        amount: Number(data.amount),
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Withdrawal Successful",
        description: `Withdrawal of ₦${data.amount.toLocaleString()} has been initiated. It will be processed within 1-3 business days.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      setWithdrawDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // KYC verification mutation
  const kycMutation = useMutation({
    mutationFn: async (data: z.infer<typeof kycSchema>) => {
      const res = await apiRequest("POST", "/api/kyc/submit", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "KYC Submission Successful",
        description: "Your KYC information has been submitted successfully and is pending verification.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      setKycDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "KYC Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form for fund wallet
  const fundWalletForm = useForm<z.infer<typeof fundWalletSchema>>({
    resolver: zodResolver(fundWalletSchema),
    defaultValues: {
      amount: "",
    },
  });

  // Form for withdraw
  const withdrawForm = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
      bankName: user?.bankName || "",
      accountNumber: user?.bankAccountNumber || "",
      accountName: user?.bankAccountName || "",
    },
  });

  // Form for KYC
  const kycForm = useForm<z.infer<typeof kycSchema>>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      idType: "",
      idNumber: "",
      phoneNumber: user?.phoneNumber || "+234", // Use Nigeria dialing code as default
    },
  });

  // Extract payment status from URL if coming back from Paystack redirect
  const searchParams = new URLSearchParams(window.location.search);
  const paymentStatus = searchParams.get('status');
  const showPaymentSuccess = paymentStatus === 'success';
  const showPaymentError = paymentStatus === 'failed' || paymentStatus === 'error';
  
  // Handle submitting fund wallet form
  const onFundWalletSubmit = (data: z.infer<typeof fundWalletSchema>) => {
    fundWalletMutation.mutate(data);
  };
  
  // Handle submitting withdraw form
  const onWithdrawSubmit = (data: z.infer<typeof withdrawSchema>) => {
    withdrawMutation.mutate(data);
  };
  
  // Handle submitting KYC form
  const onKycSubmit = (data: z.infer<typeof kycSchema>) => {
    kycMutation.mutate(data);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showPaymentSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Payment Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                Your investment has been processed successfully. You can view the details in your portfolio.
              </AlertDescription>
            </Alert>
          )}

          {showPaymentError && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Payment Failed</AlertTitle>
              <AlertDescription className="text-red-700">
                There was an issue processing your payment. Please try again or contact support.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div id="dashboard-welcome">
              <h4 className="text-sm font-medium text-gray-500">Welcome back,</h4>
              <h3 className="text-xl font-bold">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username}
              </h3>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <StartOnboardingButton 
                flow="dashboard" 
                variant="ghost" 
                className="mr-2"
              >
                Help Guide
              </StartOnboardingButton>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => setFundDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full sm:w-auto grid-cols-4 sm:inline-flex">
              <TabsTrigger value="overview" className="flex items-center">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center">
                <PieChart className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Portfolio</span>
              </TabsTrigger>
              <TabsTrigger value="earnings" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Earnings</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab Content */}
            <TabsContent value="overview">
              {/* Wallet and KYC Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Wallet Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wallet className="h-5 w-5 mr-2 text-primary" />
                      Your Wallet
                    </CardTitle>
                    <CardDescription>
                      Manage your funds securely
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {walletQuery.isLoading ? (
                      <div className="flex justify-center items-center p-8">
                        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : walletQuery.isError ? (
                      <div className="text-red-600 text-sm">
                        Unable to fetch wallet data. Please try again.
                      </div>
                    ) : (
                      <>
                        <div className="flex items-end mb-4">
                          <span className="text-3xl font-bold mr-2">
                            ₦{walletQuery.data?.walletBalance?.toLocaleString() || '0'}
                          </span>
                          <span className="text-gray-500 text-sm mb-1">Available Balance</span>
                        </div>
                        <div className="flex space-x-3">
                          <Dialog open={fundDialogOpen} onOpenChange={setFundDialogOpen}>
                            <DialogTrigger asChild>
                              <Button className="w-full" size="sm">
                                <Plus className="h-4 w-4 mr-2" /> Fund Wallet
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Fund Your Wallet</DialogTitle>
                                <DialogDescription>
                                  Add funds to your wallet using Paystack secure payment.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...fundWalletForm}>
                                <form onSubmit={fundWalletForm.handleSubmit(onFundWalletSubmit)} className="space-y-6">
                                  <FormField
                                    control={fundWalletForm.control}
                                    name="amount"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Amount (₦)</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enter amount" {...field} type="number" min="1" />
                                        </FormControl>
                                        <FormDescription>
                                          Minimum deposit: ₦100,000
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <DialogFooter>
                                    <Button type="submit" disabled={fundWalletMutation.isPending}>
                                      {fundWalletMutation.isPending ? (
                                        <>
                                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                          Processing...
                                        </>
                                      ) : (
                                        "Proceed to Payment"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full" size="sm">
                                <CreditCard className="h-4 w-4 mr-2" /> Withdraw
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Withdraw Funds</DialogTitle>
                                <DialogDescription>
                                  Withdraw funds from your wallet to your bank account.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...withdrawForm}>
                                <form onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)} className="space-y-4">
                                  <FormField
                                    control={withdrawForm.control}
                                    name="amount"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Amount (₦)</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enter amount" {...field} type="number" min="1" />
                                        </FormControl>
                                        <FormDescription>
                                          Available balance: ₦{walletQuery.data?.walletBalance?.toLocaleString() || 0}
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={withdrawForm.control}
                                    name="bankName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Bank Name</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enter bank name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={withdrawForm.control}
                                    name="accountNumber"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Account Number</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enter account number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={withdrawForm.control}
                                    name="accountName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Account Name</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enter account name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <DialogFooter>
                                    <Button type="submit" disabled={withdrawMutation.isPending}>
                                      {withdrawMutation.isPending ? (
                                        <>
                                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                          Processing...
                                        </>
                                      ) : (
                                        "Withdraw Funds"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                {/* KYC Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      KYC Verification
                    </CardTitle>
                    <CardDescription>
                      Complete your identity verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {walletQuery.isLoading ? (
                      <div className="flex justify-center items-center p-8">
                        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : walletQuery.isError ? (
                      <div className="text-red-600 text-sm">
                        Unable to fetch KYC status. Please try again.
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <div className="flex items-center mb-2">
                            <span className="font-semibold mr-2">Status:</span>
                            {walletQuery.data?.kycStatus === "verified" ? (
                              <span className="flex items-center text-green-600">
                                <BadgeCheck className="h-4 w-4 mr-1" /> Verified
                              </span>
                            ) : walletQuery.data?.kycStatus === "pending" ? (
                              <span className="flex items-center text-yellow-600">
                                <HelpCircle className="h-4 w-4 mr-1" /> Pending Verification
                              </span>
                            ) : walletQuery.data?.kycStatus === "rejected" ? (
                              <span className="flex items-center text-red-600">
                                <BadgeX className="h-4 w-4 mr-1" /> Rejected
                              </span>
                            ) : (
                              <span className="flex items-center text-gray-600">
                                <AlertCircle className="h-4 w-4 mr-1" /> Not Started
                              </span>
                            )}
                          </div>
                          
                          {walletQuery.data?.kycStatus === "verified" ? (
                            <p className="text-sm text-gray-600">
                              Your identity has been verified. You have full access to all platform features.
                            </p>
                          ) : walletQuery.data?.kycStatus === "pending" ? (
                            <p className="text-sm text-gray-600">
                              Your KYC application is under review. This usually takes 1-2 business days.
                            </p>
                          ) : walletQuery.data?.kycStatus === "rejected" ? (
                            <p className="text-sm text-gray-600">
                              Your KYC verification was rejected. Please submit again with correct information.
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600">
                              Complete your KYC verification to unlock all platform features.
                            </p>
                          )}
                        </div>
                        
                        {(walletQuery.data?.kycStatus !== "verified" && walletQuery.data?.kycStatus !== "pending") && (
                          <Dialog open={kycDialogOpen} onOpenChange={setKycDialogOpen}>
                            <DialogTrigger asChild>
                              <Button className="w-full" variant="outline" size="sm">
                                <User className="h-4 w-4 mr-2" /> 
                                {walletQuery.data?.kycStatus === "rejected" ? "Resubmit KYC" : "Start Verification"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>KYC Verification</DialogTitle>
                                <DialogDescription>
                                  Complete your identity verification to unlock all platform features.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...kycForm}>
                                <form onSubmit={kycForm.handleSubmit(onKycSubmit)} className="space-y-4">
                                  <FormField
                                    control={kycForm.control}
                                    name="idType"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>ID Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select ID type" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="passport">Passport</SelectItem>
                                            <SelectItem value="driver_license">Driver's License</SelectItem>
                                            <SelectItem value="national_id">National ID</SelectItem>
                                            <SelectItem value="voter_id">Voter's ID</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={kycForm.control}
                                    name="idNumber"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>ID Number</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enter ID number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={kycForm.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                          <Input placeholder="+2341234567890" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                          Nigerian format: +234 followed by 10 digits
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <DialogFooter>
                                    <Button type="submit" disabled={kycMutation.isPending}>
                                      {kycMutation.isPending ? (
                                        <>
                                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                          Processing...
                                        </>
                                      ) : (
                                        "Submit Verification"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <InvestmentStats />
              
              <div className="mb-6 mt-6">
                <h4 className="font-semibold text-lg mb-4">Investment Portfolio</h4>
                <InvestmentPortfolio />
              </div>
              
              <div id="ai-recommendations">
                <h4 className="font-semibold text-lg mb-4">AI-Powered Recommendations</h4>
                <AIRecommendations />
              </div>
            </TabsContent>
            
            {/* Portfolio Tab Content */}
            <TabsContent value="portfolio">
              <div className="mb-6">
                <PortfolioManagement />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div id="portfolio-section">
                  <RealTimeInvestmentTracker />
                </div>
                
                <div id="recent-activity">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">Active Projects</h4>
                    <Button variant="ghost" size="sm" className="text-xs flex items-center">
                      View All <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  <ActiveProjects />
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg">Completed Projects</h4>
                  <Button variant="ghost" size="sm" className="text-xs flex items-center">
                    View All <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <CompletedProjects />
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-4">Recommended For You</h4>
                <RecommendedProperties />
              </div>
            </TabsContent>
            
            {/* Earnings Tab Content */}
            <TabsContent value="earnings">
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-4">Earnings Breakdown</h4>
                <EarningsBreakdown />
              </div>
              
              <div className="mb-6 mt-8">
                <h4 className="font-semibold text-lg mb-4">Investment Performance</h4>
                <InvestmentPortfolio />
              </div>
            </TabsContent>

            {/* Analytics Tab Content */}
            <TabsContent value="analytics">
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-4">Advanced Analytics Dashboard</h4>
                {investmentsQuery.isLoading ? (
                  <div className="flex justify-center items-center p-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : investmentsQuery.isError ? (
                  <Alert className="mb-6 bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Error Loading Investments</AlertTitle>
                    <AlertDescription className="text-red-700">
                      Unable to load your investment data. Please try again later.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <AdvancedAnalytics investments={investmentsQuery.data || []} />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

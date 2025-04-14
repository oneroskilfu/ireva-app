import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useSafeMilestones } from "@/hooks/use-safe-milestones";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PaystackCheckout } from "@/components/payments/PaystackCheckout";
import { SocialShareButtons } from "@/components/social/SocialShareButtons";
import { 
  Banknote,
  Building2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Download,
  ExternalLink,
  FileText,
  Home, 
  Info, 
  LineChart, 
  Loader2, 
  MapPin,
  Maximize,
  Percent, 
  Play,
  ShieldCheck, 
  Sparkles,
  User,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageTransition } from "@/contexts/page-transition-context";

// Investment amount schema
const investmentFormSchema = z.object({
  amount: z.string()
    .min(1, { message: "Investment amount is required" })
    .refine(val => !isNaN(Number(val)), { message: "Amount must be a number" })
    .refine(val => Number(val) > 0, { message: "Amount must be greater than 0" })
});

type InvestmentFormValues = z.infer<typeof investmentFormSchema>;

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { triggerMilestone, checkMilestone } = useSafeMilestones();
  const { startLoading, stopLoading } = usePageTransition();
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isInvesting, setIsInvesting] = useState(false);
  
  // Trigger the first property viewed milestone when component loads
  useEffect(() => {
    // Safely check if the user is logged in before triggering the milestone
    if (user && triggerMilestone && checkMilestone && !checkMilestone('first_property_viewed')) {
      // Use a small timeout to ensure provider is fully initialized
      const timer = setTimeout(() => {
        triggerMilestone('first_property_viewed');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, triggerMilestone, checkMilestone]);
  
  // Fetch property details
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
  });

  // Setup form for investment amount
  const investmentForm = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      amount: property?.minimumInvestment?.toString() || ""
    }
  });

  // Handle investment form submission
  const onInvestSubmit = (values: InvestmentFormValues) => {
    if (!property) return;
    
    const amount = Number(values.amount);
    if (amount < property.minimumInvestment) {
      toast({
        title: "Invalid amount",
        description: `Minimum investment is ₦100,000`,
        variant: "destructive"
      });
      return;
    }
    
    setIsInvesting(true);
  };

  // Handle successful payment
  const handlePaymentSuccess = (data: any) => {
    setIsInvesting(false);
    setInvestDialogOpen(false);
    
    // Get investment amount
    const amount = Number(investmentForm.getValues().amount);
    
    // Only process milestones if the functions are available
    if (triggerMilestone && checkMilestone) {
      // Trigger first investment milestone
      if (!checkMilestone('first_investment')) {
        triggerMilestone('first_investment');
      }
      
      // Trigger investment threshold milestones based on amount
      if (amount >= 1000) {
        triggerMilestone('investment_threshold_1000');
      }
      
      if (amount >= 5000) {
        triggerMilestone('investment_threshold_5000');
      }
      
      if (amount >= 10000) {
        triggerMilestone('investment_threshold_10000');
      }
      
      // Check portfolio diversity (this is simplified, in a real app we would check actual diversity)
      // Here we just assume that if this isn't their first investment, they might have diversity
      if (checkMilestone('first_investment') && !checkMilestone('portfolio_diversified')) {
        triggerMilestone('portfolio_diversified');
      }
    }
    
    toast({
      title: "Investment successful!",
      description: "Your investment has been processed successfully.",
    });
    
    // Redirect to dashboard
    startLoading();
    setTimeout(() => {
      setLocation("/dashboard");
      stopLoading();
    }, 1000);
  };

  // Handle payment error
  const handlePaymentError = (error: Error) => {
    setIsInvesting(false);
    toast({
      title: "Payment failed",
      description: error.message,
      variant: "destructive",
    });
  };

  // Function to format percentages
  const formatPercent = (num: number | string) => {
    if (typeof num === 'string') num = parseFloat(num);
    return `${num}%`;
  };

  // Calculate funding progress percentage
  const fundingProgress = property ? (property.currentFunding / property.totalFunding) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find the property you're looking for.</p>
        <Button onClick={() => setLocation("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm"
        className="mb-4"
        onClick={() => setLocation("/")}
      >
        ← Back
      </Button>

      {/* Property Header */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Property Image */}
        <div className="lg:w-5/12 mb-4 lg:mb-0 property-image">
          <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video shadow-sm">
            <img 
              src={property.imageUrl} 
              alt={property.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Property Summary */}
        <div className="lg:w-7/12 flex flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-normal">
              {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
            </Badge>
            <Badge variant="secondary" className="font-normal">
              {property.location}
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{property.name}</h1>
          <p className="text-muted-foreground text-sm mb-4 max-w-prose">{property.description}</p>
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-5 property-stats">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Return</span>
              <span className="font-semibold flex items-center text-sm">
                <Percent className="h-3.5 w-3.5 text-primary mr-1" />
                {formatPercent(property.targetReturn)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Minimum</span>
              <span className="font-semibold flex items-center text-sm">
                <span className="text-primary font-semibold mr-1">₦</span>
                100,000
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Term</span>
              <span className="font-semibold flex items-center text-sm">
                <Calendar className="h-3.5 w-3.5 text-primary mr-1" />
                {property.term} months
              </span>
            </div>
          </div>
          
          {/* Funding Progress */}
          <div className="mb-6 property-funding-progress">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium">₦{property.currentFunding.toLocaleString()} raised</span>
              <span className="text-xs text-muted-foreground">₦{property.totalFunding.toLocaleString()} target</span>
            </div>
            <Progress value={fundingProgress} className="h-1.5" />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-muted-foreground flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {property.numberOfInvestors} investors
              </span>
              <span className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {property.daysLeft} days left
              </span>
            </div>
          </div>
          
          {/* CTA Button and Social Share */}
          <div className="mt-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {user ? (
                <Dialog open={investDialogOpen} onOpenChange={setInvestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto px-8 property-invest-button">
                      Invest Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Invest in {property.name}</DialogTitle>
                      <DialogDescription>
                        Enter the amount you would like to invest. Minimum investment is ₦100,000.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...investmentForm}>
                      <form onSubmit={investmentForm.handleSubmit(onInvestSubmit)} className="space-y-3">
                        <FormField
                          control={investmentForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Investment Amount (₦)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter amount" 
                                  {...field} 
                                  type="number"
                                  min={property.minimumInvestment}
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Minimum investment: ₦100,000
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          {isInvesting ? (
                            <PaystackCheckout 
                              property={property}
                              amount={Number(investmentForm.getValues().amount)}
                              onSuccess={handlePaymentSuccess}
                              onError={handlePaymentError}
                            />
                          ) : (
                            <Button type="submit">
                              Continue to Payment
                            </Button>
                          )}
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button className="w-full sm:w-auto px-8" onClick={() => setLocation("/auth")}>
                  Sign in to Invest
                </Button>
              )}
            </div>
            
            {/* Social Share Buttons - Separated for better visibility */}
            <div className="flex items-center mt-4 property-share-buttons">
              <span className="text-sm text-muted-foreground mr-3">Share:</span>
              <SocialShareButtons
                title={`Check out ${property.name} - ${property.targetReturn}% returns on REVA`}
                description={`${property.description} - Invest with as little as ₦100,000 in this property in ${property.location}`}
                url={`${window.location.origin}/properties/${property.id}`}
                compact
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Gallery */}
      {property.additionalImages && (
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-3">Gallery</h3>
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-3">
              {/* Main Image */}
              <CarouselItem className="pl-2 md:pl-3 basis-full sm:basis-1/2 lg:basis-1/3">
                <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
                  <img 
                    src={property.imageUrl} 
                    alt={`${property.name} main view`} 
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
              </CarouselItem>
              
              {/* Additional Images */}
              {JSON.parse(property.additionalImages || '[]').map((imgUrl: string, index: number) => (
                <CarouselItem key={index} className="pl-2 md:pl-3 basis-full sm:basis-1/2 lg:basis-1/3">
                  <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
                    <img 
                      src={imgUrl} 
                      alt={`${property.name} view ${index + 1}`} 
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                </CarouselItem>
              ))}
              
              {/* Video Preview (if available) */}
              {property.videoUrl && (
                <CarouselItem className="pl-2 md:pl-3 basis-full sm:basis-1/2 lg:basis-1/3">
                  <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden relative group">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 p-1.5 rounded-full">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-tr-md">
                      Video Tour
                    </div>
                    <img 
                      src={property.imageUrl} 
                      alt="Video preview" 
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                </CarouselItem>
              )}
              
              {/* Virtual Tour Preview (if available) */}
              {property.virtualTourUrl && (
                <CarouselItem className="pl-2 md:pl-3 basis-full sm:basis-1/2 lg:basis-1/3">
                  <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden relative group">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 p-1.5 rounded-full">
                        <Maximize className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-tr-md">
                      Virtual Tour
                    </div>
                    <img 
                      src={property.imageUrl} 
                      alt="Virtual tour preview" 
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious className="left-1 h-7 w-7" />
            <CarouselNext className="right-1 h-7 w-7" />
          </Carousel>
        </div>
      )}

      {/* Detailed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="gap-1 mb-6 md:w-auto overflow-auto p-0.5 flex w-full no-scrollbar property-tabs">
          <TabsTrigger value="overview" className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm">
            <Info className="h-3 md:h-3.5 w-3 md:w-3.5" />
            <span className="truncate">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm">
            <LineChart className="h-3 md:h-3.5 w-3 md:w-3.5" />
            <span className="truncate">Financials</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm">
            <MapPin className="h-3 md:h-3.5 w-3 md:w-3.5" />
            <span className="truncate">Location</span>
          </TabsTrigger>
          <TabsTrigger value="developer" className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm">
            <User className="h-3 md:h-3.5 w-3 md:w-3.5" />
            <span className="truncate">Developer</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm">
            <FileText className="h-3 md:h-3.5 w-3 md:w-3.5" />
            <span className="truncate">Documents</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-base font-semibold mb-3">Property Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 md:gap-4">
                  <PropertyDetailItem 
                    icon={<Building2 className="h-4 w-4 text-primary" />}
                    label="Property Type"
                    value={property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                  />
                  <PropertyDetailItem 
                    icon={<MapPin className="h-4 w-4 text-primary" />}
                    label="Location"
                    value={property.location}
                  />
                  <PropertyDetailItem 
                    icon={<Home className="h-4 w-4 text-primary" />}
                    label="Size"
                    value={property.size || "N/A"}
                  />
                  <PropertyDetailItem 
                    icon={<Calendar className="h-4 w-4 text-primary" />}
                    label="Built Year"
                    value={property.builtYear || "N/A"}
                  />
                  <PropertyDetailItem 
                    icon={<Users className="h-4 w-4 text-primary" />}
                    label="Occupancy"
                    value={property.occupancy || "N/A"}
                  />
                  <PropertyDetailItem 
                    icon={<Banknote className="h-4 w-4 text-primary" />}
                    label="Cash Flow"
                    value={property.cashFlow || "N/A"}
                  />
                </div>
              </div>
              
              {/* Property Features */}
              {property.features && (
                <div className="mt-6 md:mt-8">
                  <h3 className="text-base font-semibold mb-3">Features</h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                    {JSON.parse(property.features || '[]').map((feature: string, index: number) => (
                      <FeatureItem key={index} feature={feature} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Property Amenities */}
              {property.amenities && (
                <div className="mt-6 md:mt-8">
                  <h3 className="text-base font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                    {JSON.parse(property.amenities || '[]').map((amenity: string, index: number) => (
                      <FeatureItem key={index} feature={amenity} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-base font-semibold mb-3">Investment Overview</h3>
              <div className="space-y-3">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <span className="text-muted-foreground">Target Return</span>
                        <span className="font-semibold">{formatPercent(property.targetReturn)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <span className="text-muted-foreground">Investment Term</span>
                        <span className="font-semibold">{property.term} months</span>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <span className="text-muted-foreground">Minimum Investment</span>
                        <span className="font-semibold">₦100,000</span>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <span className="text-muted-foreground">Total Funding Target</span>
                        <span className="font-semibold">₦{property.totalFunding.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <span className="text-muted-foreground">Current Funding</span>
                        <span className="font-semibold">₦{property.currentFunding.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Number of Investors</span>
                        <span className="font-semibold">{property.numberOfInvestors}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Risk Rating */}
                {property.riskRating && (
                  <Card className="mt-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={
                          property.riskRating === "Low" ? "bg-green-100 text-green-800 hover:bg-green-100/80" : 
                          property.riskRating === "Medium" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80" : 
                          "bg-red-100 text-red-800 hover:bg-red-100/80"
                        }>
                          {property.riskRating} Risk
                        </Badge>
                      </div>
                      {property.riskDescription && (
                        <p className="text-sm text-muted-foreground">{property.riskDescription}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Financials Tab */}
        <TabsContent value="financials" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-base font-semibold mb-3">Financial Projections</h3>
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Projected Return: {formatPercent(property.targetReturn)}</span>
                    </div>
                    
                    {property.projectedIrr && (
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <span className="text-muted-foreground">Projected IRR</span>
                        <span className="font-semibold">{formatPercent(property.projectedIrr)}</span>
                      </div>
                    )}
                    
                    {property.projectedCashYield && (
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <span className="text-muted-foreground">Cash Yield</span>
                        <span className="font-semibold">{formatPercent(property.projectedCashYield)}</span>
                      </div>
                    )}
                    
                    {property.projectedAppreciation && (
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <span className="text-muted-foreground">Projected Appreciation</span>
                        <span className="font-semibold">{formatPercent(property.projectedAppreciation)}</span>
                      </div>
                    )}
                    
                    {property.projectedTotalReturn && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Projected Return</span>
                        <span className="font-semibold">{formatPercent(property.projectedTotalReturn)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-8">
                <h3 className="text-base font-semibold mb-3">Investment Timeline</h3>
                <Card>
                  <CardContent className="pt-4">
                    <div className="relative pl-5 border-l border-gray-200">
                      <div className="mb-5 relative">
                        <div className="absolute -left-[20px] bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs">
                          1
                        </div>
                        <h4 className="font-medium text-sm mb-0.5">Initial Investment</h4>
                        <p className="text-xs text-muted-foreground">Min. ₦100,000</p>
                      </div>
                      
                      <div className="mb-5 relative">
                        <div className="absolute -left-[20px] bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs">
                          2
                        </div>
                        <h4 className="font-medium text-sm mb-0.5">Quarterly Distributions</h4>
                        <p className="text-xs text-muted-foreground">Regular income payments</p>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-[20px] bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs">
                          3
                        </div>
                        <h4 className="font-medium text-sm mb-0.5">Exit ({property.term} months)</h4>
                        <p className="text-xs text-muted-foreground">Principal + appreciation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-semibold mb-3">Risk Assessment</h3>
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <RiskItem 
                      title="Market Risk" 
                      level="Low" 
                      description="Property is located in a stable market with consistent growth."
                    />
                    <RiskItem 
                      title="Liquidity Risk" 
                      level="Medium" 
                      description="Investment term is medium-length with limited options for early exit."
                    />
                    <RiskItem 
                      title="Operational Risk" 
                      level="Low" 
                      description="Experienced property management team with proven track record."
                    />
                    <RiskItem 
                      title="Regulatory Risk" 
                      level="Low" 
                      description="All necessary permits and approvals have been obtained."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Location Tab */}
        <TabsContent value="location" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-base font-semibold mb-3">Location Details</h3>
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {property.address && (
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <span className="text-muted-foreground">Address</span>
                        <span className="font-semibold">{property.address}</span>
                      </div>
                    )}
                    
                    {property.city && (
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <span className="text-muted-foreground">City</span>
                        <span className="font-semibold">{property.city}</span>
                      </div>
                    )}
                    
                    {property.state && (
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <span className="text-muted-foreground">State</span>
                        <span className="font-semibold">{property.state}</span>
                      </div>
                    )}
                    
                    {property.zipCode && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Zip Code</span>
                        <span className="font-semibold">{property.zipCode}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {property.neighborhoodDescription && (
                <div className="mt-8">
                  <h3 className="text-base font-semibold mb-3">Neighborhood</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-muted-foreground">{property.neighborhoodDescription}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-base font-semibold mb-3">Map</h3>
              {(property.latitude && property.longitude) ? (
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <div className="text-center p-4">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="font-medium">Map View</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Located at {property.latitude}, {property.longitude}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Map information not available</p>
                  </CardContent>
                </Card>
              )}
              
              <div className="mt-8">
                <h3 className="text-base font-semibold mb-3">Nearby Amenities</h3>
                <div className="space-y-2">
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Commercial Centers</h4>
                        <p className="text-sm text-muted-foreground">Within 1.5 miles</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Public Transportation</h4>
                        <p className="text-sm text-muted-foreground">Within 0.5 miles</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Schools & Universities</h4>
                        <p className="text-sm text-muted-foreground">Within 2 miles</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Developer Tab */}
        <TabsContent value="developer" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-base font-semibold mb-3">Developer Information</h3>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-4">
                    {property.developerLogoUrl && (
                      <div className="flex justify-center mb-2">
                        <img 
                          src={property.developerLogoUrl} 
                          alt={property.developerName || "Developer Logo"} 
                          className="h-16 object-contain"
                        />
                      </div>
                    )}
                    
                    {property.developerName && (
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <span className="text-muted-foreground">Developer</span>
                        <span className="font-semibold">{property.developerName}</span>
                      </div>
                    )}
                    
                    {property.developerDescription && (
                      <div className="mt-4">
                        <p className="text-muted-foreground">{property.developerDescription}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-8">
                <h3 className="text-base font-semibold mb-3">Project Timeline</h3>
                <Card>
                  <CardContent className="pt-4">
                    <div className="relative pl-5 border-l border-gray-200">
                      {property.acquisitionDate && (
                        <div className="mb-5 relative">
                          <div className="absolute -left-[18px] bg-primary/10 border border-primary text-primary w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-2 w-2" />
                          </div>
                          <h4 className="font-medium text-sm mb-0.5">Property Acquisition</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(property.acquisitionDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      
                      {property.constructionStartDate && (
                        <div className="mb-5 relative">
                          <div className="absolute -left-[18px] bg-primary/10 border border-primary text-primary w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-2 w-2" />
                          </div>
                          <h4 className="font-medium text-sm mb-0.5">Construction Start</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(property.constructionStartDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      
                      {property.estimatedCompletionDate && (
                        <div className="relative">
                          <div className="absolute -left-[18px] bg-gray-100 border border-gray-300 text-gray-500 w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            <Clock className="h-2 w-2" />
                          </div>
                          <h4 className="font-medium text-sm mb-0.5">Estimated Completion</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(property.estimatedCompletionDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-semibold mb-3">Track Record</h3>
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg mb-1">Portfolio Value</h4>
                        <p className="text-xl font-semibold">₦2+ Billion</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Total value of developed properties
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg mb-1">Projects Completed</h4>
                        <p className="text-xl font-semibold">25+</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Successful projects over the past decade
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <Percent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg mb-1">Average Returns</h4>
                        <p className="text-xl font-semibold">18.5%</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Average returns across all projects
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="pt-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-base font-semibold mb-3">Due Diligence Documents</h3>
            
            {property.documentUrls ? (
              <div className="space-y-3">
                {JSON.parse(property.documentUrls || '[]').map((doc: { title: string, url: string }, index: number) => (
                  <DocumentItem key={index} title={doc.title} url={doc.url} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No documents available at this moment</p>
                </CardContent>
              </Card>
            )}
            
            <h3 className="text-base font-semibold mb-3 mt-8">Legal Structure</h3>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    This investment is structured as a Special Purpose Vehicle (SPV) that allows investors to own 
                    shares in the property. All investors receive pro-rata distributions based on their ownership percentage.
                  </p>
                  
                  <h4 className="font-medium mt-4">Key Legal Points:</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    <li>Investors own fractional shares of the property through an LLC structure</li>
                    <li>Liability is limited to your investment amount</li>
                    <li>Quarterly distributions are made to all investors</li>
                    <li>Voting rights on major decisions proportional to investment</li>
                    <li>Exit is planned at month {property.term} with option to hold longer if market conditions favor</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <h3 className="text-base font-semibold mb-3 mt-8">Frequently Asked Questions</h3>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">How is my investment secured?</h4>
                    <p className="text-sm text-muted-foreground">
                      Your investment is secured by real estate, which is one of the most reliable asset classes. 
                      The property serves as collateral, and all investments are backed by a legal entity structure 
                      that provides security and transparency.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Can I sell my investment early?</h4>
                    <p className="text-sm text-muted-foreground">
                      While the investment is designed for a {property.term}-month hold period, 
                      we do offer a secondary marketplace where you can list your shares for sale to other investors, 
                      subject to certain conditions and availability of buyers.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">How are returns calculated?</h4>
                    <p className="text-sm text-muted-foreground">
                      Returns come from three sources: regular income distributions (from rental income), 
                      tax advantages (depreciation benefits), and appreciation of the property value over time. 
                      The target return of {formatPercent(property.targetReturn)} represents the annualized return including all these factors.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// PropertyDetailItem Component
interface PropertyDetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function PropertyDetailItem({ icon, label, value }: PropertyDetailItemProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

// Risk Item Component
interface RiskItemProps {
  title: string;
  level: "Low" | "Medium" | "High";
  description: string;
}

function RiskItem({ title, level, description }: RiskItemProps) {
  const getLevelColor = () => {
    switch (level) {
      case "Low": return "bg-green-100 text-green-700";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "High": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };
  
  return (
    <div className="flex items-start gap-2 pb-3 border-b last:border-0 last:pb-0">
      <div className={`px-1.5 py-0.5 rounded text-xs font-medium mt-0.5 ${getLevelColor()}`}>
        {level}
      </div>
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Security Item Component
interface SecurityItemProps {
  title: string;
  description: string;
}

function SecurityItem({ title, description }: SecurityItemProps) {
  return (
    <div className="border rounded-md p-3">
      <h4 className="font-medium text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

// Document Item Component
interface DocumentItemProps {
  title: string;
  url: string;
}

function DocumentItem({ title, url }: DocumentItemProps) {
  return (
    <div className="flex items-center justify-between p-2.5 border rounded-md">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">{title}</span>
      </div>
      <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
          <Download className="h-3.5 w-3.5" />
          <span className="text-xs">Download</span>
        </a>
      </Button>
    </div>
  );
}

// Property Feature Item Component
interface FeatureItemProps {
  feature: string;
}

function FeatureItem({ feature }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-1.5 py-1 px-2 bg-primary/5 rounded-md">
      <Sparkles className="h-3.5 w-3.5 text-primary" />
      <span className="text-xs">{feature}</span>
    </div>
  );
}

// Compliance Item Component
interface ComplianceItemProps {
  title: string;
  description: string;
}

function ComplianceItem({ title, description }: ComplianceItemProps) {
  return (
    <div className="p-3 bg-gray-50 rounded-md">
      <h4 className="font-medium text-sm mb-0.5">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
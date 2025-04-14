import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Check, Sparkles, Brain, BrainCircuit } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type UserPreferences = {
  riskTolerance: "low" | "medium" | "high";
  investmentGoal: "income" | "growth" | "balanced";
  investmentHorizon: "short" | "medium" | "long";
  preferredLocations?: string[];
  preferredPropertyTypes?: string[];
  minReturn?: number;
  maxInvestment?: number;
};

type PropertyRecommendation = {
  property: Property;
  score: number;
  reasons: string[];
};

type RecommendationResponse = {
  preferences: UserPreferences;
  recommendations: PropertyRecommendation[];
};

export function AIRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    riskTolerance: "medium",
    investmentGoal: "balanced",
    investmentHorizon: "medium",
    minReturn: 8,
    maxInvestment: 5000000
  });

  // Fetch recommendations from the API
  const { data, isLoading, isError, refetch } = useQuery<RecommendationResponse>({
    queryKey: ["/api/recommendations"],
    enabled: !!user, // Only fetch if user is logged in
  });

  // Update local preferences when recommendations are loaded
  useEffect(() => {
    if (data?.preferences) {
      setPreferences(data.preferences);
    }
  }, [data?.preferences]);

  // Function to save preferences
  const savePreferences = async () => {
    try {
      await apiRequest("POST", "/api/user/preferences", preferences);
      setIsPreferencesDialogOpen(false);
      refetch(); // Refresh recommendations
      toast({
        title: "Preferences saved",
        description: "Your investment preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <RecommendationsSkeleton />;
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              There was an error loading your personalized recommendations. 
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recommendations = data?.recommendations || [];

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Recommendations
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsPreferencesDialogOpen(true)}>
            Customize
          </Button>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                No recommendations available yet. Update your preferences or make some investments to get personalized recommendations.
              </p>
              <Button onClick={() => setIsPreferencesDialogOpen(true)}>
                Set Investment Preferences
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground mb-2">
                Based on your {data?.preferences.investmentGoal} investment goal, {data?.preferences.riskTolerance} risk tolerance, and {data?.preferences.investmentHorizon}-term investment horizon.
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.property.id} className="relative group">
                    <div className="absolute top-2 right-2 z-10 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {rec.score}% Match
                    </div>
                    <PropertyCard property={rec.property} />
                    <div className="mt-2 text-sm">
                      <div className="font-medium">Why we recommend this:</div>
                      <ul className="mt-1">
                        {rec.reasons.slice(0, 2).map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                            <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isPreferencesDialogOpen} onOpenChange={setIsPreferencesDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Investment Preferences
            </DialogTitle>
            <DialogDescription>
              Customize your investment preferences to get personalized property recommendations.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="goals" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="goals">Investment Goals</TabsTrigger>
              <TabsTrigger value="risk">Risk Profile</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
            </TabsList>
            
            <TabsContent value="goals" className="py-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Investment Goal</h3>
                  <RadioGroup 
                    value={preferences.investmentGoal} 
                    onValueChange={(value) => setPreferences({...preferences, investmentGoal: value as any})}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="income" id="goal-income" />
                      <Label htmlFor="goal-income" className="flex-1">Income Focus - Maximize regular cash flow</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="growth" id="goal-growth" />
                      <Label htmlFor="goal-growth" className="flex-1">Growth Focus - Maximize capital appreciation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="balanced" id="goal-balanced" />
                      <Label htmlFor="goal-balanced" className="flex-1">Balanced - Mix of income and growth</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Investment Horizon</h3>
                  <RadioGroup 
                    value={preferences.investmentHorizon} 
                    onValueChange={(value) => setPreferences({...preferences, investmentHorizon: value as any})}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="short" id="horizon-short" />
                      <Label htmlFor="horizon-short" className="flex-1">Short-term (1-2 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="horizon-medium" />
                      <Label htmlFor="horizon-medium" className="flex-1">Medium-term (3-4 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="long" id="horizon-long" />
                      <Label htmlFor="horizon-long" className="flex-1">Long-term (5+ years)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="risk" className="py-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Risk Tolerance</h3>
                  <RadioGroup 
                    value={preferences.riskTolerance} 
                    onValueChange={(value) => setPreferences({...preferences, riskTolerance: value as any})}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="risk-low" />
                      <Label htmlFor="risk-low" className="flex-1">Low Risk - Focus on stability and preservation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="risk-medium" />
                      <Label htmlFor="risk-medium" className="flex-1">Medium Risk - Balance risk and return</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="risk-high" />
                      <Label htmlFor="risk-high" className="flex-1">High Risk - Focus on maximum returns</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="min-return">Minimum Expected Return (%)</Label>
                      <span className="text-sm text-muted-foreground">{preferences.minReturn || 0}%</span>
                    </div>
                    <Slider
                      id="min-return"
                      min={5}
                      max={25}
                      step={1}
                      value={[preferences.minReturn || 8]}
                      onValueChange={(values) => setPreferences({...preferences, minReturn: values[0]})}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5%</span>
                      <span>15%</span>
                      <span>25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="filters" className="py-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="max-investment">Maximum Investment Amount (₦)</Label>
                      <span className="text-sm text-muted-foreground">₦{(preferences.maxInvestment || 5000000).toLocaleString()}</span>
                    </div>
                    <Slider
                      id="max-investment"
                      min={100000}
                      max={10000000}
                      step={100000}
                      value={[preferences.maxInvestment || 5000000]}
                      onValueChange={(values) => setPreferences({...preferences, maxInvestment: values[0]})}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₦100k</span>
                      <span>₦5M</span>
                      <span>₦10M</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Preferred Property Types</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="type-residential"
                        checked={preferences.preferredPropertyTypes?.includes("residential") ?? false}
                        onChange={(e) => {
                          const types = preferences.preferredPropertyTypes || [];
                          if (e.target.checked) {
                            setPreferences({
                              ...preferences,
                              preferredPropertyTypes: [...types, "residential"]
                            });
                          } else {
                            setPreferences({
                              ...preferences,
                              preferredPropertyTypes: types.filter(t => t !== "residential")
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="type-residential">Residential</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="type-commercial"
                        checked={preferences.preferredPropertyTypes?.includes("commercial") ?? false}
                        onChange={(e) => {
                          const types = preferences.preferredPropertyTypes || [];
                          if (e.target.checked) {
                            setPreferences({
                              ...preferences,
                              preferredPropertyTypes: [...types, "commercial"]
                            });
                          } else {
                            setPreferences({
                              ...preferences,
                              preferredPropertyTypes: types.filter(t => t !== "commercial")
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="type-commercial">Commercial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="type-industrial"
                        checked={preferences.preferredPropertyTypes?.includes("industrial") ?? false}
                        onChange={(e) => {
                          const types = preferences.preferredPropertyTypes || [];
                          if (e.target.checked) {
                            setPreferences({
                              ...preferences,
                              preferredPropertyTypes: [...types, "industrial"]
                            });
                          } else {
                            setPreferences({
                              ...preferences,
                              preferredPropertyTypes: types.filter(t => t !== "industrial")
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="type-industrial">Industrial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="type-mixed-use"
                        checked={preferences.preferredPropertyTypes?.includes("mixed-use") ?? false}
                        onChange={(e) => {
                          const types = preferences.preferredPropertyTypes || [];
                          if (e.target.checked) {
                            setPreferences({
                              ...preferences,
                              preferredPropertyTypes: [...types, "mixed-use"]
                            });
                          } else {
                            setPreferences({
                              ...preferences,
                              preferredPropertyTypes: types.filter(t => t !== "mixed-use")
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="type-mixed-use">Mixed-Use</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Preferred Locations</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="location-lagos"
                        checked={preferences.preferredLocations?.includes("Lagos") ?? false}
                        onChange={(e) => {
                          const locations = preferences.preferredLocations || [];
                          if (e.target.checked) {
                            setPreferences({
                              ...preferences,
                              preferredLocations: [...locations, "Lagos"]
                            });
                          } else {
                            setPreferences({
                              ...preferences,
                              preferredLocations: locations.filter(l => l !== "Lagos")
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="location-lagos">Lagos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="location-abuja"
                        checked={preferences.preferredLocations?.includes("Abuja") ?? false}
                        onChange={(e) => {
                          const locations = preferences.preferredLocations || [];
                          if (e.target.checked) {
                            setPreferences({
                              ...preferences,
                              preferredLocations: [...locations, "Abuja"]
                            });
                          } else {
                            setPreferences({
                              ...preferences,
                              preferredLocations: locations.filter(l => l !== "Abuja")
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="location-abuja">Abuja</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreferencesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePreferences}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RecommendationsSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Skeleton className="h-4 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
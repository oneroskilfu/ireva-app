import { useParams } from "wouter";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyDetails from "@/components/properties/PropertyDetails";
import { InvestmentTutorialWizard } from "@/components/tutorial/InvestmentTutorialWizard";
import { GuidedPropertyTutorial } from "@/components/tutorial/GuidedPropertyTutorial";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AchievementsDisplay } from "@/components/gamification/AchievementsDisplay";
import { AchievementBadge } from "@/components/gamification/AchievementBadge";

export default function PropertyPage() {
  const [showBasicTutorial, setShowBasicTutorial] = useState(false);
  const [hasViewedProperty, setHasViewedProperty] = useLocalStorage("reva-property-viewed", false);
  const { user } = useAuth();
  
  // Mark property as viewed for returning users
  useEffect(() => {
    if (!hasViewedProperty) {
      setHasViewedProperty(true);
      // We would trigger milestone here if user is logged in
      // This is handled by the MilestoneContext in a real implementation
    }
  }, [hasViewedProperty]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <GuidedPropertyTutorial 
                onComplete={() => console.log("Guided tutorial completed")} 
                autoStart={false} // Set to false while we fix the error
              />
              {/* Show property_viewed badge if the user has viewed this property */}
              {hasViewedProperty && (
                <AchievementBadge type="property_viewed" size="sm" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Compact achievements display */}
              <AchievementsDisplay 
                userId={user?.id} 
                compact={true} 
              />
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1.5"
                onClick={() => setShowBasicTutorial(true)}
              >
                <HelpCircle className="h-4 w-4" />
                <span>Investment Help</span>
              </Button>
            </div>
          </div>
          
          <PropertyDetails />
          
          {/* Investment tutorial dialog */}
          {showBasicTutorial && (
            <InvestmentTutorialWizard 
              autoOpen={true} 
              onComplete={() => setShowBasicTutorial(false)} 
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

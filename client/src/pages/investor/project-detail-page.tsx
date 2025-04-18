import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import InvestorLayout from '@/components/layouts/InvestorLayout';
import InvestmentForm from '@/components/Investor/InvestmentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  Building, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Users, 
  AlertCircle, 
  ArrowLeft, 
  Clock, 
  Home, 
  BriefcaseBusiness,
  FileText,
  CalendarClock,
  CheckCircle,
  LineChart
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Define the Property type interface
interface Property {
  id: number;
  name: string;
  location: string;
  description: string;
  type: string;
  imageUrl: string;
  imageGallery?: string[];
  videoUrl?: string | null;
  tier: string;
  targetReturn: string;
  minimumInvestment: number;
  term: number;
  totalFunding: number;
  currentFunding: number;
  numberOfInvestors: number;
  size?: string | null;
  builtYear?: string | null;
  occupancy?: string | null;
  cashFlow?: string | null;
  daysLeft?: number;
  amenities?: string[];
  developer: string;
  developerProfile?: string | null;
  riskLevel?: string | null;
  projectedCashflow?: any | null;
  documents?: any[] | null;
  latitude?: string | null;
  longitude?: string | null;
  accreditedOnly: boolean;
  sustainabilityFeatures?: string[] | null;
  constructionUpdates?: any[] | null;
  completionDate?: string | null;
}

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  
  const { data: project, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/properties/${id}`);
        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`);
        }
        return await res.json();
      } catch (err) {
        console.error('Error fetching project details:', err);
        throw err;
      }
    }
  });

  if (isLoading) {
    return (
      <InvestorLayout>
        <div className="container mx-auto py-6 max-w-7xl">
          <div className="mb-4">
            <Skeleton className="h-8 w-40" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-80 w-full rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </InvestorLayout>
    );
  }

  if (error || !project) {
    return (
      <InvestorLayout>
        <div className="container mx-auto py-6">
          <EmptyState
            icon={<AlertCircle className="h-10 w-10 text-red-500" />}
            title="Error loading project"
            description="We couldn't load this project. It may have been removed or you may not have permission to view it."
            onAction={() => setLocation('/investor/projects')}
            actionLabel="Back to Projects"
          />
        </div>
      </InvestorLayout>
    );
  }

  // Calculate funding percentage
  const fundingPercentage = Math.round((project.currentFunding / project.totalFunding) * 100);
  
  return (
    <InvestorLayout>
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4 gap-1"
            onClick={() => setLocation('/investor/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <Badge variant="outline" className="ml-2 text-xs">
                  {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                </Badge>
              </div>
              <p className="text-muted-foreground flex items-center">
                <MapPin className="h-4 w-4 mr-1" /> 
                {project.location}
              </p>
            </div>
            
            <div className="flex gap-2">
              {project.currentFunding < project.totalFunding && (
                <Button size="lg" className="gap-1" onClick={() => {
                  const detailsElement = document.getElementById('invest-section');
                  detailsElement?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Invest Now
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project image */}
            <div className="rounded-lg overflow-hidden h-80">
              <img 
                src={project.imageUrl} 
                alt={project.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Tabs for project details */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="developer">Developer</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Project Description</h2>
                  <p className="text-muted-foreground">
                    {project.description}
                  </p>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Investment Highlights</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <TrendingUp className="h-8 w-8 text-primary mb-2" />
                          <div className="text-lg font-bold">{project.targetReturn}%</div>
                          <div className="text-sm text-muted-foreground">Target ROI</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <Calendar className="h-8 w-8 text-primary mb-2" />
                          <div className="text-lg font-bold">{project.term} months</div>
                          <div className="text-sm text-muted-foreground">Investment Term</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <Users className="h-8 w-8 text-primary mb-2" />
                          <div className="text-lg font-bold">{project.numberOfInvestors}</div>
                          <div className="text-sm text-muted-foreground">Investors</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <Clock className="h-8 w-8 text-primary mb-2" />
                          <div className="text-lg font-bold">{project.daysLeft}</div>
                          <div className="text-sm text-muted-foreground">Days Left</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {project.amenities && project.amenities.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {project.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center p-2 bg-muted rounded-md">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Property Features</h3>
                    <div className="space-y-2 text-muted-foreground">
                      {project.size && (
                        <div className="flex justify-between border-b py-2">
                          <span className="flex items-center">
                            <Home className="h-4 w-4 mr-2" /> Size
                          </span>
                          <span className="font-medium text-foreground">{project.size}</span>
                        </div>
                      )}
                      
                      {project.builtYear && (
                        <div className="flex justify-between border-b py-2">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" /> Built Year
                          </span>
                          <span className="font-medium text-foreground">{project.builtYear}</span>
                        </div>
                      )}
                      
                      {project.occupancy && (
                        <div className="flex justify-between border-b py-2">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-2" /> Occupancy
                          </span>
                          <span className="font-medium text-foreground">{project.occupancy}</span>
                        </div>
                      )}
                      
                      {project.cashFlow && (
                        <div className="flex justify-between border-b py-2">
                          <span className="flex items-center">
                            <LineChart className="h-4 w-4 mr-2" /> Annual Cash Flow
                          </span>
                          <span className="font-medium text-foreground">{project.cashFlow}</span>
                        </div>
                      )}
                      
                      {project.riskLevel && (
                        <div className="flex justify-between border-b py-2">
                          <span className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" /> Risk Level
                          </span>
                          <span className="font-medium text-foreground">
                            {project.riskLevel.charAt(0).toUpperCase() + project.riskLevel.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Investment Details</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex justify-between border-b py-2">
                        <span className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" /> Target ROI
                        </span>
                        <span className="font-medium text-foreground">{project.targetReturn}%</span>
                      </div>
                      
                      <div className="flex justify-between border-b py-2">
                        <span className="flex items-center">
                          <CalendarClock className="h-4 w-4 mr-2" /> Investment Term
                        </span>
                        <span className="font-medium text-foreground">{project.term} months</span>
                      </div>
                      
                      <div className="flex justify-between border-b py-2">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" /> Minimum Investment
                        </span>
                        <span className="font-medium text-foreground">₦{project.minimumInvestment.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between border-b py-2">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-2" /> Investment Tier
                        </span>
                        <span className="font-medium text-foreground capitalize">{project.tier}</span>
                      </div>
                      
                      {project.accreditedOnly && (
                        <div className="flex justify-between border-b py-2">
                          <span className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" /> Accredited Only
                          </span>
                          <span className="font-medium text-foreground">Yes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="developer" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Developer Information</h3>
                  <div className="flex items-center mb-4">
                    <BriefcaseBusiness className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <div className="font-semibold text-lg">{project.developer}</div>
                      <div className="text-sm text-muted-foreground">Property Developer</div>
                    </div>
                  </div>
                  
                  {project.developerProfile ? (
                    <p className="text-muted-foreground">{project.developerProfile}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      {project.developer} is a reputable real estate developer with a strong track record in the Nigerian market.
                      They specialize in creating high-quality {project.type} properties with excellent return on investment.
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Project Documents</h3>
                  {project.documents && project.documents.length > 0 ? (
                    <div className="space-y-2">
                      {project.documents.map((doc, index) => (
                        <Card key={index}>
                          <CardContent className="flex items-center p-4">
                            <FileText className="h-6 w-6 text-primary mr-3" />
                            <div className="flex-grow">
                              <div className="font-medium">{doc.name}</div>
                              <div className="text-xs text-muted-foreground">{doc.size}</div>
                            </div>
                            <Button variant="outline" size="sm">
                              Download
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-muted rounded-lg">
                      <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Project documents will be available after investment or upon request.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right sidebar */}
          <div id="invest-section" className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="pt-6 space-y-4">
                {/* Funding progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Funding Progress</span>
                    <span className="font-medium">{fundingPercentage}%</span>
                  </div>
                  <Progress value={fundingPercentage} className="h-2" />
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Raised: ₦{project.currentFunding.toLocaleString()}</span>
                    <span className="text-muted-foreground">Goal: ₦{project.totalFunding.toLocaleString()}</span>
                  </div>
                </div>
                
                <Separator />
                
                {/* Project stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Min. Investment</div>
                    <div className="font-semibold">₦{project.minimumInvestment.toLocaleString()}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Investors</div>
                    <div className="font-semibold">{project.numberOfInvestors}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Days Left</div>
                    <div className="font-semibold">{project.daysLeft}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Maturity</div>
                    <div className="font-semibold">{project.term} months</div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Investment component */}
                <InvestmentForm property={project} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </InvestorLayout>
  );
};

export default ProjectDetailPage;
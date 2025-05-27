import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { 
  ArrowLeft, MapPin, Calendar, TrendingUp, DollarSign, 
  Building, Users, Shield, Star, Heart, Share2,
  Phone, Mail, CheckCircle, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface PropertyDetails {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  propertyType: string;
  status: 'active' | 'funding' | 'completed';
  targetAmount: number;
  raisedAmount: number;
  expectedROI: number;
  images: string[];
  createdAt: string;
  features: string[];
  specifications: {
    bedrooms?: number;
    bathrooms?: number;
    area: number;
    yearBuilt?: number;
    parking?: number;
  };
  developer: {
    name: string;
    rating: number;
    projects: number;
    contact: {
      phone: string;
      email: string;
    };
  };
  documents: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  timeline: Array<{
    phase: string;
    description: string;
    expectedDate: string;
    status: 'pending' | 'in-progress' | 'completed';
  }>;
  risks: string[];
  returns: {
    rentalYield: number;
    capitalAppreciation: number;
    totalReturn: number;
  };
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['/api/properties', id],
    enabled: !!id
  });

  const investmentMutation = useMutation({
    mutationFn: async (amount: number) => {
      return apiClient.request(`/api/properties/${id}/invest`, {
        method: 'POST',
        body: JSON.stringify({ amount })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties', id] });
      toast({
        title: "Investment Successful!",
        description: "Your investment has been processed successfully.",
      });
      setShowInvestmentForm(false);
      setInvestmentAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Investment Failed",
        description: error.message || "Unable to process your investment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateFundingProgress = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'funding': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleInvestment = () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount.",
        variant: "destructive"
      });
      return;
    }

    if (amount < 100000) {
      toast({
        title: "Minimum Investment",
        description: "Minimum investment amount is ₦100,000.",
        variant: "destructive"
      });
      return;
    }

    investmentMutation.mutate(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or has been removed.</p>
          <Link href="/properties">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const fundingProgress = calculateFundingProgress(property.raisedAmount, property.targetAmount);
  const remainingAmount = property.targetAmount - property.raisedAmount;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/properties" className="text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-gray-400">/</span>
        <Link href="/properties" className="text-blue-600 hover:text-blue-800">Properties</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">{property.title}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              {property.location}
            </div>
            <Badge className={getStatusColor(property.status)}>
              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="col-span-3">
          <img
            src={property.images[selectedImageIndex] || '/api/placeholder/800/400'}
            alt={property.title}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
        <div className="space-y-2">
          {property.images.slice(0, 4).map((image, index) => (
            <img
              key={index}
              src={image || '/api/placeholder/200/100'}
              alt={`Property ${index + 1}`}
              className={`w-full h-20 object-cover rounded cursor-pointer ${
                index === selectedImageIndex ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedImageIndex(index)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-6">{property.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {property.specifications.bedrooms && (
                      <div className="text-center">
                        <div className="font-semibold text-lg">{property.specifications.bedrooms}</div>
                        <div className="text-sm text-gray-600">Bedrooms</div>
                      </div>
                    )}
                    {property.specifications.bathrooms && (
                      <div className="text-center">
                        <div className="font-semibold text-lg">{property.specifications.bathrooms}</div>
                        <div className="text-sm text-gray-600">Bathrooms</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="font-semibold text-lg">{property.specifications.area.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">sq ft</div>
                    </div>
                    {property.specifications.parking && (
                      <div className="text-center">
                        <div className="font-semibold text-lg">{property.specifications.parking}</div>
                        <div className="text-sm text-gray-600">Parking</div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Features & Amenities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Developer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{property.developer.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < property.developer.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {property.developer.projects} projects completed
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Phone className="h-4 w-4" />
                        {property.developer.contact.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {property.developer.contact.email}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expected Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{property.returns.rentalYield}%</div>
                      <div className="text-sm text-gray-600">Rental Yield</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{property.returns.capitalAppreciation}%</div>
                      <div className="text-sm text-gray-600">Capital Appreciation</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{property.returns.totalReturn}%</div>
                      <div className="text-sm text-gray-600">Total Return</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {property.risks.map((risk, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <span className="text-sm text-gray-700">{risk}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Legal Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {property.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-gray-600">{doc.type}</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {property.timeline.map((phase, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`w-4 h-4 rounded-full mt-1 ${
                          phase.status === 'completed' ? 'bg-green-500' :
                          phase.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium">{phase.phase}</div>
                          <div className="text-sm text-gray-600 mb-1">{phase.description}</div>
                          <div className="text-xs text-gray-500">Expected: {phase.expectedDate}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Investment Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Investment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatCurrency(property.price)}
                </div>
                <div className="text-sm text-gray-600">Minimum Investment</div>
              </div>

              {property.status === 'funding' && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Funding Progress</span>
                    <span>{Math.round(fundingProgress)}%</span>
                  </div>
                  <Progress value={fundingProgress} className="mb-2" />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Raised: {formatCurrency(property.raisedAmount)}</span>
                    <span>Target: {formatCurrency(property.targetAmount)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Expected ROI:</span>
                  <span className="font-semibold text-green-600">{property.expectedROI}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Property Type:</span>
                  <span className="font-medium">{property.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Listed:</span>
                  <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {property.status === 'funding' && (
                <div className="pt-4 border-t">
                  {!showInvestmentForm ? (
                    <Button 
                      className="w-full" 
                      onClick={() => setShowInvestmentForm(true)}
                    >
                      Invest Now
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter amount (₦)"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        type="number"
                        min="100000"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleInvestment}
                          disabled={investmentMutation.isPending}
                          className="flex-1"
                        >
                          {investmentMutation.isPending ? 'Processing...' : 'Confirm'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowInvestmentForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        Minimum investment: ₦100,000
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Area</span>
                <span className="font-medium">{property.specifications.area.toLocaleString()} sq ft</span>
              </div>
              {property.specifications.yearBuilt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Year Built</span>
                  <span className="font-medium">{property.specifications.yearBuilt}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Property ID</span>
                <span className="font-medium font-mono text-xs">{property.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  TrendingUp, DollarSign, Building, FileCheck, 
  AlertCircle, CheckCircle, Clock, Eye,
  Calendar, MapPin, ArrowUpRight, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api';

interface InvestorStats {
  totalInvestments: number;
  totalValue: number;
  activeProperties: number;
  expectedReturns: number;
  portfolioGrowth: number;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'incomplete';
}

interface Investment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  amount: number;
  investmentDate: string;
  status: 'active' | 'completed' | 'pending';
  expectedROI: number;
  currentValue: number;
  returns: number;
}

interface Property {
  id: string;
  title: string;
  location: string;
  investmentAmount: number;
  investmentDate: string;
  status: 'active' | 'funding' | 'completed';
  expectedROI: number;
  currentROI: number;
  totalShares: number;
  ownedShares: number;
  images: string[];
}

interface KYCDocument {
  id: string;
  type: 'identity' | 'address' | 'income' | 'bank';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  rejectionReason?: string;
}

export default function InvestorDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch investor statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/investor/stats'],
  });

  // Fetch investor's properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/investor/properties'],
  });

  // Fetch investment history
  const { data: investments, isLoading: investmentsLoading } = useQuery({
    queryKey: ['/api/investor/investments'],
  });

  // Fetch KYC status and documents
  const { data: kycData, isLoading: kycLoading } = useQuery({
    queryKey: ['/api/investor/kyc'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKYCStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculatePortfolioPerformance = (properties: Property[]) => {
    if (!properties?.length) return { totalInvested: 0, currentValue: 0, totalReturns: 0 };
    
    const totalInvested = properties.reduce((sum, prop) => sum + prop.investmentAmount, 0);
    const currentValue = properties.reduce((sum, prop) => sum + (prop.investmentAmount * (1 + prop.currentROI / 100)), 0);
    const totalReturns = currentValue - totalInvested;
    
    return { totalInvested, currentValue, totalReturns };
  };

  const portfolioPerf = calculatePortfolioPerformance(properties || []);

  if (statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment Portfolio</h1>
          <p className="text-gray-600">Track your real estate investments and returns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Link href="/properties">
            <Button>
              <Building className="h-4 w-4 mr-2" />
              Browse Properties
            </Button>
          </Link>
        </div>
      </div>

      {/* KYC Status Alert */}
      {stats?.kycStatus !== 'approved' && (
        <div className="mb-6">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800">
                    KYC Verification {stats?.kycStatus === 'pending' ? 'Pending' : 'Required'}
                  </h3>
                  <p className="text-sm text-amber-700">
                    {stats?.kycStatus === 'pending' 
                      ? 'Your documents are under review. This may take 2-3 business days.'
                      : 'Complete your KYC verification to start investing in properties.'
                    }
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {stats?.kycStatus === 'pending' ? 'Check Status' : 'Complete KYC'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="investments">Investment History</TabsTrigger>
          <TabsTrigger value="kyc">KYC Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Portfolio Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(portfolioPerf.totalInvested)}</div>
                <p className="text-xs text-muted-foreground">
                  Across {stats?.activeProperties || 0} properties
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(portfolioPerf.currentValue)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={portfolioPerf.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {portfolioPerf.totalReturns >= 0 ? '+' : ''}{formatCurrency(portfolioPerf.totalReturns)}
                  </span> total returns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeProperties || 0}</div>
                <p className="text-xs text-muted-foreground">
                  In your portfolio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Growth</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {portfolioPerf.totalInvested > 0 
                    ? `${((portfolioPerf.totalReturns / portfolioPerf.totalInvested) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall return rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments?.slice(0, 5).map((investment: Investment) => (
                    <div key={investment.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{investment.propertyTitle}</div>
                        <div className="text-sm text-gray-600">{investment.propertyLocation}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(investment.amount)}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(investment.investmentDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Best Performing Property</span>
                    <span className="font-semibold text-green-600">
                      {properties && properties.length > 0 
                        ? `${Math.max(...properties.map((p: Property) => p.currentROI)).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average ROI</span>
                    <span className="font-semibold">
                      {properties && properties.length > 0
                        ? `${(properties.reduce((sum: number, p: Property) => sum + p.currentROI, 0) / properties.length).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Dividends Received</span>
                    <span className="font-semibold">{formatCurrency(stats?.expectedReturns || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          {propertiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties?.map((property: Property) => (
                <Card key={property.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={property.images[0] || '/api/placeholder/300/200'}
                      alt={property.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className={`absolute top-3 right-3 ${getStatusColor(property.status)}`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Investment Amount</span>
                      <span className="font-semibold">{formatCurrency(property.investmentAmount)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current ROI</span>
                      <span className={`font-semibold ${property.currentROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {property.currentROI.toFixed(1)}%
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Your Ownership</span>
                        <span>{((property.ownedShares / property.totalShares) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(property.ownedShares / property.totalShares) * 100} />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/properties/${property.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {properties?.length === 0 && (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Yet</h3>
              <p className="text-gray-600 mb-4">
                Start building your real estate portfolio today.
              </p>
              <Link href="/properties">
                <Button>Browse Properties</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment History</CardTitle>
            </CardHeader>
            <CardContent>
              {investmentsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Investment Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expected ROI</TableHead>
                      <TableHead>Current Value</TableHead>
                      <TableHead>Returns</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments?.map((investment: Investment) => (
                      <TableRow key={investment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{investment.propertyTitle}</div>
                            <div className="text-sm text-gray-600">{investment.propertyLocation}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(investment.investmentDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(investment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(investment.status)}>
                            {investment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{investment.expectedROI}%</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(investment.currentValue)}
                        </TableCell>
                        <TableCell>
                          <span className={investment.returns >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {investment.returns >= 0 ? '+' : ''}{formatCurrency(investment.returns)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                KYC Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  {getKYCStatusIcon(stats?.kycStatus || 'incomplete')}
                  <span className="font-semibold text-lg">
                    {stats?.kycStatus === 'approved' && 'Verification Complete'}
                    {stats?.kycStatus === 'pending' && 'Under Review'}
                    {stats?.kycStatus === 'rejected' && 'Verification Rejected'}
                    {stats?.kycStatus === 'incomplete' && 'Verification Required'}
                  </span>
                </div>
                <p className="text-gray-600">
                  {stats?.kycStatus === 'approved' && 'Your account is fully verified. You can invest in all properties.'}
                  {stats?.kycStatus === 'pending' && 'Your documents are being reviewed. This typically takes 2-3 business days.'}
                  {stats?.kycStatus === 'rejected' && 'Some documents were rejected. Please review and resubmit.'}
                  {stats?.kycStatus === 'incomplete' && 'Please complete your verification to start investing.'}
                </p>
              </div>

              {kycLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-3">Document Status</h3>
                  {kycData?.documents?.map((doc: KYCDocument) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getKYCStatusIcon(doc.status)}
                        <div>
                          <div className="font-medium capitalize">{doc.type} Document</div>
                          <div className="text-sm text-gray-600">
                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </div>
                          {doc.rejectionReason && (
                            <div className="text-sm text-red-600 mt-1">
                              Reason: {doc.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                        {doc.status === 'rejected' && (
                          <Button size="sm" variant="outline">
                            Resubmit
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!kycData?.documents || kycData.documents.length === 0) && (
                    <div className="text-center py-8">
                      <FileCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Uploaded</h3>
                      <p className="text-gray-600 mb-4">
                        Upload your documents to complete verification.
                      </p>
                      <Button>Start KYC Process</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
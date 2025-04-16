import React, { useState } from 'react';
import { useRoute } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyGrid from '@/components/properties/PropertyGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Building, 
  Factory, 
  LayoutGrid, 
  LandPlot,
  Search,
  MapPin,
  Filter,
  SortAsc
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function PropertiesPage() {
  // Extract property type from the URL if present
  const [, params] = useRoute('/properties/:type');
  const initialType = params?.type || 'all';
  
  // State for filters
  const [propertyType, setPropertyType] = useState<string>(initialType);
  const [location, setLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [minInvestment, setMinInvestment] = useState<string>('');
  const [maxInvestment, setMaxInvestment] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will be applied through the state updates
  };

  // Helper to get icon for property type
  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'residential':
        return <Home className="h-4 w-4 mr-2" />;
      case 'commercial':
        return <Building className="h-4 w-4 mr-2" />;
      case 'industrial':
        return <Factory className="h-4 w-4 mr-2" />;
      case 'mixed-use':
        return <LayoutGrid className="h-4 w-4 mr-2" />;
      case 'land':
        return <LandPlot className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  // Format property type for display
  const formatPropertyType = (type: string) => {
    if (type === 'all') return 'All Properties';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero section with page title */}
        <section className="bg-white py-12 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {getPropertyTypeIcon(propertyType)}
              {formatPropertyType(propertyType)}
            </h1>
            <p className="mt-2 text-gray-600 max-w-3xl">
              Explore our curated selection of high-yield investment opportunities across Nigeria's most promising real estate markets.
            </p>
          </div>
        </section>

        {/* Filters and search section */}
        <section className="bg-white border-b py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Search bar */}
              <form onSubmit={handleSearch} className="relative w-full md:w-auto md:flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </form>
              
              {/* Filter controls */}
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="return-high">Highest Return</SelectItem>
                    <SelectItem value="return-low">Lowest Return</SelectItem>
                    <SelectItem value="investment-low">Lowest Investment</SelectItem>
                    <SelectItem value="investment-high">Highest Investment</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-[180px]">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Lagos">Lagos</SelectItem>
                    <SelectItem value="Abuja">Abuja</SelectItem>
                    <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                    <SelectItem value="Ibadan">Ibadan</SelectItem>
                    <SelectItem value="Kano">Kano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Advanced filters (collapsible) */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Investment (₦)</label>
                    <Input
                      type="number"
                      placeholder="Min amount"
                      value={minInvestment}
                      onChange={(e) => setMinInvestment(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Investment (₦)</label>
                    <Input
                      type="number"
                      placeholder="Max amount"
                      value={maxInvestment}
                      onChange={(e) => setMaxInvestment(e.target.value)}
                    />
                  </div>
                  {/* Additional filters can be added here */}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => {
                      setMinInvestment('');
                      setMaxInvestment('');
                      setSearchQuery('');
                      setLocation('all');
                      setSortBy('newest');
                    }}
                  >
                    Reset Filters
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>Apply</Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Property type tabs */}
        <section className="py-6 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue={propertyType} onValueChange={setPropertyType}>
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                <TabsTrigger value="all" className="flex items-center justify-center">
                  All
                </TabsTrigger>
                <TabsTrigger value="residential" className="flex items-center justify-center">
                  <Home className="h-4 w-4 mr-2" />
                  Residential
                </TabsTrigger>
                <TabsTrigger value="commercial" className="flex items-center justify-center">
                  <Building className="h-4 w-4 mr-2" />
                  Commercial
                </TabsTrigger>
                <TabsTrigger value="industrial" className="flex items-center justify-center">
                  <Factory className="h-4 w-4 mr-2" />
                  Industrial
                </TabsTrigger>
                <TabsTrigger value="mixed-use" className="flex items-center justify-center">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Mixed-use
                </TabsTrigger>
                <TabsTrigger value="land" className="flex items-center justify-center">
                  <LandPlot className="h-4 w-4 mr-2" />
                  Land
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <PropertyGrid type="all" location={location} search={searchQuery} />
              </TabsContent>
              
              <TabsContent value="residential" className="mt-6">
                <PropertyGrid type="residential" location={location} search={searchQuery} />
              </TabsContent>
              
              <TabsContent value="commercial" className="mt-6">
                <PropertyGrid type="commercial" location={location} search={searchQuery} />
              </TabsContent>
              
              <TabsContent value="industrial" className="mt-6">
                <PropertyGrid type="industrial" location={location} search={searchQuery} />
              </TabsContent>
              
              <TabsContent value="mixed-use" className="mt-6">
                <PropertyGrid type="mixed-use" location={location} search={searchQuery} />
              </TabsContent>
              
              <TabsContent value="land" className="mt-6">
                <PropertyGrid type="land" location={location} search={searchQuery} />
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Why invest section */}
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Invest with iREVA?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Fractional Ownership</h3>
                  <p className="text-gray-600">
                    Access premium real estate with as little as ₦100,000. Own shares in high-value properties that would otherwise be out of reach.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Superior Returns</h3>
                  <p className="text-gray-600">
                    Our properties consistently deliver 10-15% annual returns, outperforming traditional savings and many other investment vehicles.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Expert Management</h3>
                  <p className="text-gray-600">
                    Our team handles all property management, maintenance, and tenant relations, making your investment truly passive.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
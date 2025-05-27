import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Search, MapPin, DollarSign, Building, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';

interface Property {
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
}

interface PropertyFilters {
  search: string;
  location: string;
  priceRange: string;
  propertyType: string;
  status: string;
  sortBy: string;
}

export default function PropertyListPage() {
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    location: '',
    priceRange: '',
    propertyType: '',
    status: '',
    sortBy: 'newest'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['/api/properties', filters],
    select: (data) => filterAndSortProperties(data, filters)
  });

  const filterAndSortProperties = (properties: Property[], filters: PropertyFilters) => {
    if (!properties) return [];

    let filtered = properties.filter(property => {
      const matchesSearch = !filters.search || 
        property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.location.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesLocation = !filters.location || 
        property.location.toLowerCase().includes(filters.location.toLowerCase());
      
      const matchesType = !filters.propertyType || 
        property.propertyType === filters.propertyType;
      
      const matchesStatus = !filters.status || 
        property.status === filters.status;

      const matchesPrice = !filters.priceRange || (() => {
        const price = property.price;
        switch (filters.priceRange) {
          case 'under-1m': return price < 1000000;
          case '1m-5m': return price >= 1000000 && price <= 5000000;
          case '5m-10m': return price >= 5000000 && price <= 10000000;
          case 'over-10m': return price > 10000000;
          default: return true;
        }
      })();

      return matchesSearch && matchesLocation && matchesType && matchesStatus && matchesPrice;
    });

    // Sort properties
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'roi-high': return b.expectedROI - a.expectedROI;
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: return 0;
      }
    });

    return filtered;
  };

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Properties</h2>
          <p className="text-gray-600 mb-4">We're having trouble loading the property listings. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Properties</h1>
        <p className="text-gray-600">Discover premium real estate investment opportunities across Nigeria</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Location */}
          <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="lagos">Lagos</SelectItem>
              <SelectItem value="abuja">Abuja</SelectItem>
              <SelectItem value="port-harcourt">Port Harcourt</SelectItem>
              <SelectItem value="kano">Kano</SelectItem>
              <SelectItem value="ibadan">Ibadan</SelectItem>
            </SelectContent>
          </Select>

          {/* Price Range */}
          <Select value={filters.priceRange} onValueChange={(value) => setFilters({ ...filters, priceRange: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-1m">Under ₦1M</SelectItem>
              <SelectItem value="1m-5m">₦1M - ₦5M</SelectItem>
              <SelectItem value="5m-10m">₦5M - ₦10M</SelectItem>
              <SelectItem value="over-10m">Over ₦10M</SelectItem>
            </SelectContent>
          </Select>

          {/* Property Type */}
          <Select value={filters.propertyType} onValueChange={(value) => setFilters({ ...filters, propertyType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="mixed-use">Mixed Use</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="roi-high">Highest ROI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            {properties?.length || 0} properties found
          </p>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {properties && properties.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-6"
        }>
          {properties.map((property) => (
            <Card key={property.id} className="group hover:shadow-lg transition-shadow duration-300">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={property.images[0] || '/api/placeholder/400/240'}
                  alt={property.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className={`absolute top-3 right-3 ${getStatusColor(property.status)}`}>
                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </Badge>
              </div>

              <CardHeader>
                <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                  {property.title}
                </h3>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {property.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Investment Price</span>
                    <span className="font-semibold text-lg">{formatCurrency(property.price)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Expected ROI</span>
                    <span className="font-semibold text-green-600">{property.expectedROI}%</span>
                  </div>

                  {property.status === 'funding' && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Funding Progress</span>
                        <span>{Math.round(calculateFundingProgress(property.raisedAmount, property.targetAmount))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateFundingProgress(property.raisedAmount, property.targetAmount)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Link href={`/properties/${property.id}`} className="w-full">
                  <Button className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters to see more properties.
          </p>
          <Button 
            onClick={() => setFilters({
              search: '',
              location: '',
              priceRange: '',
              propertyType: '',
              status: '',
              sortBy: 'newest'
            })}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
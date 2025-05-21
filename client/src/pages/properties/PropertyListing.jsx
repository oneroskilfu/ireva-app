import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useRoute } from 'wouter';
import { 
  Card, 
  Button, 
  Progress, 
  Badge,
  Input, 
  Select,
  Spinner
} from '../../components/ui/DesignSystem';
import { useApiRequest } from '../../hooks/useApiRequest';
import { ErrorBoundaryWithMonitoring } from '../../components/ErrorBoundary';
import { debounce } from '../../utils/helpers';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  SquaresPlusIcon,
  CalendarIcon,
  ArrowSmallRightIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Format currency values
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(Number(value));
};

// Format percentage values
const formatPercent = (value) => {
  return `${Number(value).toFixed(2)}%`;
};

// Property listing page
const PropertyListing = () => {
  // Router
  const [, navigate] = useLocation();
  
  // State
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 9
  });
  
  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    minROI: '',
    maxROI: '',
    location: '',
    status: 'active'
  });
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sorting, setSorting] = useState({
    sortBy: 'createdAt',
    order: 'desc'
  });
  const [propertyTypes, setPropertyTypes] = useState([]);
  
  // API hook
  const propertiesApi = useApiRequest();
  
  // Load property types for filter dropdown
  useEffect(() => {
    const loadPropertyTypes = async () => {
      try {
        const response = await propertiesApi.get('properties/stats');
        if (response && response.data && response.data.propertyTypes) {
          setPropertyTypes(response.data.propertyTypes);
        }
      } catch (error) {
        console.error('Failed to load property types:', error);
      }
    };
    
    loadPropertyTypes();
  }, []);
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      // Reset to page 1 when search changes
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 500),
    []
  );
  
  // Handle search input change
  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };
  
  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      minROI: '',
      maxROI: '',
      location: '',
      status: 'active'
    });
    setSearchTerm('');
    document.getElementById('search-input').value = '';
  };
  
  // Toggle filters panel
  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    const [sortBy, order] = e.target.value.split('-');
    setSorting({ sortBy, order });
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };
  
  // Navigate to property details
  const viewPropertyDetails = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };
  
  // Load properties
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setIsLoading(true);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        
        // Add pagination
        queryParams.append('page', pagination.currentPage);
        queryParams.append('limit', pagination.limit);
        
        // Add sorting
        queryParams.append('sortBy', sorting.sortBy);
        queryParams.append('order', sorting.order);
        
        // Add filters
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, value);
          }
        });
        
        // Make API request
        const response = await propertiesApi.get(`properties?${queryParams.toString()}`);
        
        if (response && response.data) {
          setProperties(response.data.properties || []);
          setPagination(response.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.data.properties?.length || 0,
            limit: pagination.limit
          });
        }
      } catch (error) {
        console.error('Failed to load properties:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProperties();
  }, [searchTerm, filters, sorting, pagination.currentPage, pagination.limit]);
  
  // Count active filters
  const activeFilterCount = Object.values(filters).filter(value => value !== '' && value !== 'active').length;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ErrorBoundaryWithMonitoring componentName="PropertyListing">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Properties</h1>
          <p className="text-gray-600">
            Browse our curated selection of high-quality real estate investment opportunities
          </p>
        </div>
        
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="search-input"
              placeholder="Search by property name or location..."
              className="pl-10"
              defaultValue={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant={filtersVisible ? "primary" : "outline"}
              onClick={toggleFilters}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-foreground text-primary text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            
            <Select 
              className="min-w-[180px]"
              onChange={handleSortChange}
              value={`${sorting.sortBy}-${sorting.order}`}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="roi-desc">Highest ROI First</option>
              <option value="fundingProgress-desc">Most Funded First</option>
            </Select>
          </div>
        </div>
        
        {/* Filters panel */}
        {filtersVisible && (
          <Card className="mb-6 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Filter Properties</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
                className="text-sm flex items-center gap-1"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Property Type</label>
                <Select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                >
                  <option value="">All Types</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">ROI Range (%)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minROI}
                    onChange={(e) => handleFilterChange('minROI', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxROI}
                    onChange={(e) => handleFilterChange('maxROI', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  placeholder="City, State, or Country"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
            </div>
          </Card>
        )}
        
        {/* Properties grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-500">Loading investment opportunities...</p>
          </div>
        ) : properties.length === 0 ? (
          <Card className="p-8 text-center">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No properties found</h3>
            <p className="text-gray-500 mb-4">
              We couldn't find any properties matching your current filters.
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {properties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  onViewDetails={viewPropertyDetails} 
                />
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.currentPage === 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={pagination.currentPage === page ? "primary" : "outline"}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </ErrorBoundaryWithMonitoring>
    </div>
  );
};

// Property card component
const PropertyCard = ({ property, onViewDetails }) => {
  const {
    id,
    name,
    location,
    propertyType,
    price,
    roi,
    fundingGoal,
    fundingProgress,
    minInvestment,
    duration,
    images,
    status
  } = property;
  
  // Calculate funding percentage
  const fundingPercentage = (Number(fundingProgress) / Number(fundingGoal) * 100).toFixed(2);
  
  // Format duration in months
  const formatDuration = (months) => {
    if (months < 12) {
      return `${months} month${months === 1 ? '' : 's'}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} year${years === 1 ? '' : 's'}`;
      } else {
        return `${years} year${years === 1 ? '' : 's'}, ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
      }
    }
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col transition-transform duration-200 hover:transform hover:shadow-lg border border-gray-200">
      {/* Property Image */}
      <div 
        className="h-48 bg-gray-200 relative"
        style={{
          backgroundImage: images && images.length > 0 ? `url(${images[0]})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {status && (
          <Badge
            variant={
              status === 'active' ? 'success' :
              status === 'pending' ? 'warning' :
              status === 'completed' ? 'info' :
              'default'
            }
            className="absolute top-3 right-3"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )}
        
        {!images || images.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <BuildingOfficeIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Property Content */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="mb-3">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-lg line-clamp-1">{name}</h3>
          </div>
          <div className="flex items-center text-gray-500 text-sm mb-1">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="text-sm text-gray-500 capitalize">
            {propertyType}
          </div>
        </div>
        
        {/* Funding Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Funding Progress</span>
            <span className="font-medium">{fundingPercentage}%</span>
          </div>
          <Progress
            value={Number(fundingProgress)}
            max={Number(fundingGoal)}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatCurrency(fundingProgress)} raised</span>
            <span>Goal: {formatCurrency(fundingGoal)}</span>
          </div>
        </div>
        
        {/* Property Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Price</div>
            <div className="font-bold">{formatCurrency(price)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Expected ROI</div>
            <div className="font-bold text-green-600">{formatPercent(roi)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Min Investment</div>
            <div className="font-medium">{formatCurrency(minInvestment)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Duration</div>
            <div className="font-medium">{formatDuration(duration)}</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-auto flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails(id)}
          >
            Details
          </Button>
          <Button className="flex-1 flex items-center justify-center">
            <span>Invest Now</span>
            <ArrowSmallRightIcon className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PropertyListing;
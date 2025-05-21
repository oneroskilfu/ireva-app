import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useToast } from '../../hooks/use-toast';
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Textarea,
  Progress,
} from '../ui/DesignSystem';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FunnelIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

const PropertyManagement = () => {
  const api = useApiRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [imageUploadMode, setImageUploadMode] = useState(false); // For toggling image upload UI
  
  // Form state
  const [propertyForm, setPropertyForm] = useState({
    name: '',
    description: '',
    location: '',
    propertyType: 'residential',
    price: '',
    size: '',
    roi: '',
    fundingGoal: '',
    minInvestment: '',
    maxInvestment: '',
    duration: '',
    status: 'pending',
    features: [],
    images: [],
    latitude: '',
    longitude: '',
  });
  
  // Image handling state
  const [tempImages, setTempImages] = useState([]);
  const [featureInput, setFeatureInput] = useState('');
  
  // Feature types options
  const propertyTypes = [
    'residential', 
    'commercial', 
    'industrial', 
    'retail', 
    'hospitality', 
    'land', 
    'mixed-use', 
    'office'
  ];
  
  // Build query params
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    if (searchTerm) params.append('search', searchTerm);
    if (typeFilter) params.append('propertyType', typeFilter);
    if (statusFilter) params.append('status', statusFilter);
    
    return params.toString();
  };
  
  // Fetch properties
  const { 
    data: propertiesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/admin/properties?${buildQueryParams()}`],
    queryFn: async () => {
      const response = await api.get(`admin/properties?${buildQueryParams()}`);
      return response.data.data;
    },
    refetchOnWindowFocus: false,
  });
  
  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (propertyData) => {
      const response = await api.post('admin/properties', propertyData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/admin/properties']);
      setIsCreateModalOpen(false);
      resetForm();
      
      toast({
        title: 'Property created',
        description: 'The property has been created successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create property',
        variant: 'destructive',
      });
    },
  });
  
  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async ({ propertyId, propertyData }) => {
      const response = await api.patch(`admin/properties/${propertyId}`, propertyData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/admin/properties']);
      setIsEditModalOpen(false);
      
      toast({
        title: 'Property updated',
        description: 'The property has been updated successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update property',
        variant: 'destructive',
      });
    },
  });
  
  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId) => {
      const response = await api.delete(`admin/properties/${propertyId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/admin/properties']);
      setIsDeleteModalOpen(false);
      setSelectedProperty(null);
      
      toast({
        title: 'Property deleted',
        description: 'The property has been deleted successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete property',
        variant: 'destructive',
      });
    },
  });
  
  // Reset form
  const resetForm = () => {
    setPropertyForm({
      name: '',
      description: '',
      location: '',
      propertyType: 'residential',
      price: '',
      size: '',
      roi: '',
      fundingGoal: '',
      minInvestment: '',
      maxInvestment: '',
      duration: '',
      status: 'pending',
      features: [],
      images: [],
      latitude: '',
      longitude: '',
    });
    setTempImages([]);
    setFeatureInput('');
    setImageUploadMode(false);
  };
  
  // Handle form change
  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle numeric inputs
    if (['price', 'size', 'roi', 'fundingGoal', 'minInvestment', 'maxInvestment', 'duration', 'latitude', 'longitude'].includes(name)) {
      setPropertyForm(prev => ({
        ...prev,
        [name]: type === 'number' ? value : value.replace(/[^0-9.]/g, '')
      }));
    } else {
      setPropertyForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Process each file
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setTempImages(prev => [...prev, { url: imageUrl, file }]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Remove temporary image
  const removeImage = (index) => {
    setTempImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Add feature
  const addFeature = () => {
    if (featureInput.trim()) {
      setPropertyForm(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };
  
  // Remove feature
  const removeFeature = (index) => {
    setPropertyForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };
  
  // Handle create property
  const handleCreateProperty = async (e) => {
    e.preventDefault();
    
    // Prepare data
    const formData = new FormData();
    
    // Add property details
    Object.entries(propertyForm).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'features') {
        formData.append(key, value);
      }
    });
    
    // Add features as JSON
    formData.append('features', JSON.stringify(propertyForm.features));
    
    // Add image files
    tempImages.forEach((image, index) => {
      formData.append(`images`, image.file);
    });
    
    // Submit form
    createPropertyMutation.mutate(formData);
  };
  
  // Handle edit property
  const handleEditProperty = async (e) => {
    e.preventDefault();
    
    // Prepare data
    const formData = new FormData();
    
    // Add property details
    Object.entries(propertyForm).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'features') {
        formData.append(key, value);
      }
    });
    
    // Add features as JSON
    formData.append('features', JSON.stringify(propertyForm.features));
    
    // Add new image files if any
    if (tempImages.length > 0) {
      tempImages.forEach((image, index) => {
        if (image.file) { // Only add files, not existing URLs
          formData.append(`images`, image.file);
        }
      });
    }
    
    // Add existing images to keep
    if (propertyForm.images?.length > 0) {
      formData.append('existingImages', JSON.stringify(propertyForm.images));
    }
    
    // Submit form
    updatePropertyMutation.mutate({
      propertyId: selectedProperty.id,
      propertyData: formData
    });
  };
  
  // Handle delete property
  const handleDeleteProperty = () => {
    if (selectedProperty) {
      deletePropertyMutation.mutate(selectedProperty.id);
    }
  };
  
  // Open edit property modal
  const openEditModal = (property) => {
    setSelectedProperty(property);
    setPropertyForm({
      name: property.name || '',
      description: property.description || '',
      location: property.location || '',
      propertyType: property.propertyType || 'residential',
      price: property.price || '',
      size: property.size || '',
      roi: property.roi || '',
      fundingGoal: property.fundingGoal || '',
      minInvestment: property.minInvestment || '',
      maxInvestment: property.maxInvestment || '',
      duration: property.duration || '',
      status: property.status || 'pending',
      features: property.features || [],
      images: property.images || [],
      latitude: property.latitude || '',
      longitude: property.longitude || '',
    });
    setTempImages(property.images?.map(url => ({ url })) || []);
    setIsEditModalOpen(true);
  };
  
  // Open delete property modal
  const openDeleteModal = (property) => {
    setSelectedProperty(property);
    setIsDeleteModalOpen(true);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setPage(1);
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Number(value));
  };
  
  // Format percentage
  const formatPercent = (value) => {
    return `${Number(value).toFixed(2)}%`;
  };
  
  // Calculate funding percentage
  const calculateFundingPercentage = (current, goal) => {
    if (!current || !goal) return 0;
    return (Number(current) / Number(goal)) * 100;
  };
  
  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page !== 1) setPage(1);
      else refetch();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, typeFilter, statusFilter]);
  
  return (
    <div>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Property Management</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
                {(typeFilter || statusFilter) && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {(typeFilter ? 1 : 0) + (statusFilter ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              
              <Button 
                onClick={refetch} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button 
                onClick={() => {
                  resetForm();
                  setIsCreateModalOpen(true);
                }}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Property
              </Button>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-grow">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setSearchTerm('')}
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md mb-4">
                <div>
                  <Label htmlFor="type-filter">Property Type</Label>
                  <Select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="mt-1"
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
                  <Label htmlFor="status-filter">Status</Label>
                  <Select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="mt-1"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="ghost" 
                    onClick={resetFilters}
                    disabled={!typeFilter && !statusFilter && !searchTerm}
                    className="mt-1"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Properties Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 font-medium">Property</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Location</th>
                  <th className="text-right p-3 font-medium">Price</th>
                  <th className="text-right p-3 font-medium">ROI</th>
                  <th className="text-left p-3 font-medium">Funding</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center p-4">
                      <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="text-center p-4 text-red-600">
                      Failed to load properties. {error.message}
                    </td>
                  </tr>
                ) : propertiesData?.properties?.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-4 text-gray-500">
                      No properties found
                    </td>
                  </tr>
                ) : (
                  propertiesData?.properties?.map((property) => (
                    <tr key={property.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded overflow-hidden mr-3">
                            {property.images && property.images.length > 0 ? (
                              <img 
                                src={property.images[0]} 
                                alt={property.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                <PhotoIcon className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="font-medium">{property.name || '-'}</div>
                        </div>
                      </td>
                      <td className="p-3 capitalize">{property.propertyType}</td>
                      <td className="p-3">{property.location}</td>
                      <td className="p-3 text-right">
                        {formatCurrency(property.price)}
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-green-600">{formatPercent(property.roi)}</span>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{formatPercent(calculateFundingPercentage(property.fundingProgress, property.fundingGoal))}</span>
                            <span>{formatCurrency(property.fundingProgress)} / {formatCurrency(property.fundingGoal)}</span>
                          </div>
                          <Progress
                            value={calculateFundingPercentage(property.fundingProgress, property.fundingGoal)}
                            max={100}
                            className="h-2"
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={
                          property.status === 'active' ? 'success' : 
                          property.status === 'pending' ? 'warning' : 
                          property.status === 'completed' ? 'info' : 
                          'default'
                        }>
                          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditModal(property)}
                            title="Edit Property"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.location.href = `/admin/properties/${property.id}`}
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDeleteModal(property)}
                            title="Delete Property"
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {propertiesData?.pagination && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, propertiesData.pagination.totalItems)} of {propertiesData.pagination.totalItems} properties
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, propertiesData.pagination.totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNumber;
                  if (propertiesData.pagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (page <= 3) {
                    pageNumber = i + 1;
                  } else if (page >= propertiesData.pagination.totalPages - 2) {
                    pageNumber = propertiesData.pagination.totalPages - 4 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }
                  
                  if (pageNumber < 1 || pageNumber > propertiesData.pagination.totalPages) {
                    return null;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={page === pageNumber ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="outline"
                  size="sm"
                  disabled={page === propertiesData.pagination.totalPages}
                  onClick={() => setPage(p => Math.min(propertiesData.pagination.totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <Select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-16"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create/Edit Property Modal */}
      <Dialog 
        open={isCreateModalOpen || isEditModalOpen} 
        onOpenChange={(open) => {
          if (isCreateModalOpen) setIsCreateModalOpen(open);
          if (isEditModalOpen) setIsEditModalOpen(open);
          if (!open) setImageUploadMode(false);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? 'Edit Property' : 'Add New Property'}</DialogTitle>
            <DialogDescription>
              {isEditModalOpen 
                ? 'Update property details and listing information.' 
                : 'Add a new property to the platform.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={isEditModalOpen ? handleEditProperty : handleCreateProperty}>
            {imageUploadMode ? (
              <div className="py-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Property Images</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setImageUploadMode(false)}
                  >
                    Back to Details
                  </Button>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="images" className="mb-2 block">Upload Images</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <input
                      type="file"
                      id="images"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <ArrowUpTrayIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-1">Drag and drop images here or click to browse</p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                    </label>
                  </div>
                </div>
                
                {tempImages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Selected Images</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {tempImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={image.url} 
                            alt={`Property ${index + 1}`} 
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                          >
                            <XMarkIcon className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Property Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={propertyForm.name}
                      onChange={handleFormChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={propertyForm.location}
                      onChange={handleFormChange}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={propertyForm.description}
                    onChange={handleFormChange}
                    className="mt-1"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select
                      id="propertyType"
                      name="propertyType"
                      value={propertyForm.propertyType}
                      onChange={handleFormChange}
                      className="mt-1"
                      required
                    >
                      {propertyTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      id="status"
                      name="status"
                      value={propertyForm.status}
                      onChange={handleFormChange}
                      className="mt-1"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Property Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={propertyForm.price}
                      onChange={handleFormChange}
                      className="mt-1"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="size">Size (sq ft)</Label>
                    <Input
                      id="size"
                      name="size"
                      type="number"
                      value={propertyForm.size}
                      onChange={handleFormChange}
                      className="mt-1"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roi">Expected ROI (%)</Label>
                    <Input
                      id="roi"
                      name="roi"
                      type="number"
                      value={propertyForm.roi}
                      onChange={handleFormChange}
                      className="mt-1"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration (months)</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      value={propertyForm.duration}
                      onChange={handleFormChange}
                      className="mt-1"
                      min="1"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fundingGoal">Funding Goal ($)</Label>
                    <Input
                      id="fundingGoal"
                      name="fundingGoal"
                      type="number"
                      value={propertyForm.fundingGoal}
                      onChange={handleFormChange}
                      className="mt-1"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="minInvestment">Minimum Investment ($)</Label>
                    <Input
                      id="minInvestment"
                      name="minInvestment"
                      type="number"
                      value={propertyForm.minInvestment}
                      onChange={handleFormChange}
                      className="mt-1"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxInvestment">Maximum Investment ($)</Label>
                    <Input
                      id="maxInvestment"
                      name="maxInvestment"
                      type="number"
                      value={propertyForm.maxInvestment}
                      onChange={handleFormChange}
                      className="mt-1"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional. Leave empty for no maximum.</p>
                  </div>
                  
                  <div className="flex flex-col">
                    <Label className="mb-1">Features</Label>
                    <div className="flex gap-2">
                      <Input
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        placeholder="Add property feature"
                      />
                      <Button 
                        type="button" 
                        onClick={addFeature}
                        disabled={!featureInput.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
                
                {propertyForm.features.length > 0 && (
                  <div>
                    <Label>Property Features</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {propertyForm.features.map((feature, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-xs"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude (optional)</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      value={propertyForm.latitude}
                      onChange={handleFormChange}
                      className="mt-1"
                      step="any"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="longitude">Longitude (optional)</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      value={propertyForm.longitude}
                      onChange={handleFormChange}
                      className="mt-1"
                      step="any"
                    />
                  </div>
                </div>
                
                <div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setImageUploadMode(true)}
                    className="w-full"
                  >
                    <PhotoIcon className="h-4 w-4 mr-2" />
                    {tempImages.length > 0 
                      ? `Manage Images (${tempImages.length} uploaded)` 
                      : 'Upload Property Images'}
                  </Button>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (isCreateModalOpen) setIsCreateModalOpen(false);
                  if (isEditModalOpen) setIsEditModalOpen(false);
                }}
              >
                Cancel
              </Button>
              
              {!imageUploadMode && (
                <Button 
                  type="submit"
                  disabled={isCreateModalOpen ? createPropertyMutation.isPending : updatePropertyMutation.isPending}
                >
                  {isCreateModalOpen ? (
                    createPropertyMutation.isPending ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Property'
                    )
                  ) : (
                    updatePropertyMutation.isPending ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Save Changes'
                    )
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Property Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Delete Property
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded mb-4">
                <p><strong>Name:</strong> {selectedProperty.name}</p>
                <p><strong>Location:</strong> {selectedProperty.location}</p>
                <p><strong>Type:</strong> {selectedProperty.propertyType}</p>
                <p><strong>Price:</strong> {formatCurrency(selectedProperty.price)}</p>
              </div>
              
              <p className="text-red-600 text-sm">
                Warning: Deleting this property will remove all its associated data including investments, documents, and updates.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={handleDeleteProperty}
              disabled={deletePropertyMutation.isPending}
            >
              {deletePropertyMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Property
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyManagement;
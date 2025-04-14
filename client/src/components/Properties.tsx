import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth.js';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, PlusCircle, MapPin, Building, Home, Warehouse, LayoutGrid, Trash2, Edit, Eye } from 'lucide-react';

interface Property {
  _id?: string;
  id?: number;
  title?: string;
  name?: string;
  description?: string;
  location: string;
  status: string;
  type: string;
  price: number;
  images?: string[];
  features?: string[];
  createdAt?: string;
}

const propertyTypes = [
  { value: 'Residential', icon: <Home className="h-4 w-4 mr-1" /> },
  { value: 'Commercial', icon: <Building className="h-4 w-4 mr-1" /> },
  { value: 'Industrial', icon: <Warehouse className="h-4 w-4 mr-1" /> },
  { value: 'Land', icon: <MapPin className="h-4 w-4 mr-1" /> },
  { value: 'Mixed-Use', icon: <LayoutGrid className="h-4 w-4 mr-1" /> }
];

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    description: '',
    location: '',
    status: 'Available',
    type: 'Residential',
    price: 0,
    features: []
  });
  const [creating, setCreating] = useState(false);
  
  const { toast } = useToast();

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/properties', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setProperties(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
      setLoading(false);
    }
  };

  const createProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.price) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setCreating(true);
      await axios.post('/api/properties', formData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      setFormData({
        title: '',
        description: '',
        location: '',
        status: 'Available',
        type: 'Residential',
        price: 0,
        features: []
      });
      setIsAdding(false);
      setCreating(false);
      
      toast({
        title: 'Property Created',
        description: 'The property has been successfully added',
      });
      
      fetchProperties();
    } catch (err: any) {
      setCreating(false);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create property',
        variant: 'destructive'
      });
    }
  };

  const deleteProperty = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/properties/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast({
        title: 'Property Deleted',
        description: 'The property has been successfully deleted',
      });
      fetchProperties();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete property',
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    // Convert price to number
    if (name === 'price') {
      processedValue = parseFloat(value);
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    const title = property.title || property.name || '';
    const matchesSearch = searchTerm === '' || 
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || property.status === statusFilter;
    const matchesType = typeFilter === '' || property.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Sold':
        return 'bg-red-100 text-red-800';
      case 'Reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl ml-72">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Property Management</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => fetchProperties()}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded flex items-center"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : ''}
            Refresh
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors flex items-center"
          >
            {isAdding ? 'Cancel' : <>
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Property
            </>}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Property</h2>
          <form onSubmit={createProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Property Title*</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Location*</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Property Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.value}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Reserved">Reserved</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Price (₦)*</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              ></textarea>
            </div>
            
            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                disabled={creating}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors"
              >
                {creating ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Creating...
                  </span>
                ) : (
                  'Create Property'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4"
              placeholder="Search properties by title or location..."
            />
          </div>
          
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-4"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Reserved">Reserved</option>
              <option value="Under Review">Under Review</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-4"
            >
              <option value="">All Types</option>
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.value}</option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No properties found. Try adjusting your filters or add a new property.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <tr key={property._id || property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {property.title || property.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {property.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {property.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {propertyTypes.find(t => t.value === property.type)?.icon || <Building className="h-4 w-4 mr-1" />}
                        {property.type || 'Residential'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getStatusBadgeClass(property.status)
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      ₦{property.price?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-gray-600 hover:text-gray-900"
                          title="View property details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit property"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => deleteProperty(property._id || property.id!)}
                          title="Delete property"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
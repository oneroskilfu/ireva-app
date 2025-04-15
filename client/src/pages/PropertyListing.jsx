import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { propertyService } from '../services/api';
import { isAuthenticated, getUserRole } from '../utils/auth';
import { toast } from 'react-toastify';

const PropertyListing = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchProperties();
  }, [filters]);
  
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await propertyService.getAllProperties(filters);
      setProperties(res.data);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleInvestClick = (property) => {
    if (!isAuthenticated()) {
      toast.info('Please sign in to invest in this property');
      navigate('/?redirect=' + encodeURIComponent(`/properties/${property.id}/invest`));
      return;
    }
    
    navigate(`/properties/${property.id}/invest`);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const calculateProgress = (current, total) => {
    return (current / total) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Available Investment Properties
        </h1>
        
        {/* Filter section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Filter Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="">All Locations</option>
                <option value="lagos">Lagos</option>
                <option value="abuja">Abuja</option>
                <option value="portHarcourt">Port Harcourt</option>
                <option value="ibadan">Ibadan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="mixed-use">Mixed-Use</option>
                <option value="land">Land</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Investment (₦)</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Investment (₦)</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="newest">Newest</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="returnDesc">Return: High to Low</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {/* Property cards */}
            {properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No properties found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map(property => (
                  <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-xl">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={property.imageUrl || '/default-property.jpg'} 
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 m-2 rounded-full text-sm font-semibold">
                        {property.targetReturn}% ROI
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{property.name}</h3>
                        <span className="text-sm text-white bg-blue-600 px-2 py-1 rounded">
                          {property.type}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{property.location}</p>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>
                      
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Funding Progress</span>
                          <span className="text-sm text-gray-600">{Math.round(calculateProgress(property.currentFunding, property.totalFunding))}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full" 
                            style={{ width: `${calculateProgress(property.currentFunding, property.totalFunding)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                        <div>
                          <p className="text-sm text-gray-500">Minimum Investment</p>
                          <p className="font-bold">{formatCurrency(property.minimumInvestment)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Term Length</p>
                          <p className="font-bold">{property.term} years</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link 
                          to={`/properties/${property.id}`}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 text-center font-medium rounded hover:bg-gray-300"
                        >
                          View Details
                        </Link>
                        <button 
                          onClick={() => handleInvestClick(property)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white text-center font-medium rounded hover:bg-red-700"
                        >
                          Invest Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyListing;
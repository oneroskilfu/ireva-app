import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiEye, FiFilter } from 'react-icons/fi';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const PropertyCard = ({ property, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div 
        className="h-40 bg-gray-200 bg-cover bg-center" 
        style={{ backgroundImage: `url(${property.imageUrl || '/placeholder-property.jpg'})` }}
      ></div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{property.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{property.location}</p>
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-primary-dark font-bold">₦{property.price.toLocaleString()}</span>
          </div>
          <div>
            <span className={`px-2 py-1 rounded-full text-xs ${
              property.type === 'Residential' 
                ? 'bg-blue-100 text-blue-700' 
                : property.type === 'Commercial' 
                ? 'bg-purple-100 text-purple-700'
                : property.type === 'Industrial'
                ? 'bg-orange-100 text-orange-700'
                : property.type === 'Land'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {property.type}
            </span>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-sm text-gray-500">
            {property.investmentCount || 0} investors
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => onView(property)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="View Details"
            >
              <FiEye size={18} />
            </button>
            <button 
              onClick={() => onEdit(property)}
              className="p-1 text-green-600 hover:text-green-800"
              title="Edit Property"
            >
              <FiEdit size={18} />
            </button>
            <button 
              onClick={() => onDelete(property)}
              className="p-1 text-red-600 hover:text-red-800"
              title="Delete Property"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProperties();
  }, [filterType]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/properties');
      
      // Apply filters based on filterType if not "all"
      let filteredProperties = res.data;
      if (filterType !== 'all') {
        filteredProperties = res.data.filter(property => property.type === filterType);
      }
      
      setProperties(filteredProperties);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, search would be done server-side
    // For now, we'll rely on client-side filtering via the searchTerm state
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setViewModalVisible(true);
  };

  const handleEditProperty = (property) => {
    // Placeholder for edit functionality
    console.log("Edit property:", property);
  };

  const openDeleteModal = (property) => {
    setSelectedProperty(property);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setSelectedProperty(null);
  };

  const closeViewModal = () => {
    setViewModalVisible(false);
    setSelectedProperty(null);
  };

  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;
    
    try {
      setActionLoading(true);
      await api.delete(`/properties/${selectedProperty.id}`);
      
      // Update local state
      setProperties(prevProperties => 
        prevProperties.filter(property => property.id !== selectedProperty.id)
      );
      
      closeDeleteModal();
      setSuccessMessage('Property deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Error deleting property:", err);
      setError('Failed to delete the property. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && properties.length === 0) {
    return <LoadingSpinner />;
  }

  // Filter properties based on search term
  const filteredProperties = searchTerm
    ? properties.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : properties;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Properties</h1>
          <p className="text-gray-600">Manage real estate listings on the platform</p>
        </div>
        <button className="btn btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Add Property
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                className="form-control pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
            </div>
          </form>

          {/* Filter buttons */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              className={`px-3 py-2 rounded-md flex items-center text-sm ${
                filterType === 'all' ? 'bg-primary-color text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              <FiFilter className="mr-2" />
              All Types
            </button>
            <button
              className={`px-3 py-2 rounded-md flex items-center text-sm whitespace-nowrap ${
                filterType === 'Residential' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('Residential')}
            >
              Residential
            </button>
            <button
              className={`px-3 py-2 rounded-md flex items-center text-sm whitespace-nowrap ${
                filterType === 'Commercial' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('Commercial')}
            >
              Commercial
            </button>
            <button
              className={`px-3 py-2 rounded-md flex items-center text-sm whitespace-nowrap ${
                filterType === 'Industrial' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('Industrial')}
            >
              Industrial
            </button>
            <button
              className={`px-3 py-2 rounded-md flex items-center text-sm whitespace-nowrap ${
                filterType === 'Land' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('Land')}
            >
              Land
            </button>
            <button
              className={`px-3 py-2 rounded-md flex items-center text-sm whitespace-nowrap ${
                filterType === 'Mixed-Use' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('Mixed-Use')}
            >
              Mixed-Use
            </button>
          </div>
        </div>

        {/* Property Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onView={handleViewProperty}
                onEdit={handleEditProperty}
                onDelete={openDeleteModal}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Properties Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all'
                ? "Try adjusting your search or filters"
                : "Add your first property to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the property <strong>{selectedProperty?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={closeDeleteModal}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDeleteProperty}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Property Modal */}
      {viewModalVisible && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedProperty.name}</h3>
              <button 
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-6">
              <img 
                src={selectedProperty.imageUrl || '/placeholder-property.jpg'} 
                alt={selectedProperty.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">Property Details</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Location:</span> {selectedProperty.location}</p>
                  <p><span className="font-medium">Type:</span> {selectedProperty.type}</p>
                  <p><span className="font-medium">Price:</span> ₦{selectedProperty.price.toLocaleString()}</p>
                  <p><span className="font-medium">ROI:</span> {selectedProperty.roi}%</p>
                  <p><span className="font-medium">Size:</span> {selectedProperty.size} sqm</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Investment Details</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Minimum Investment:</span> ₦{selectedProperty.minimumInvestment?.toLocaleString() || '100,000'}</p>
                  <p><span className="font-medium">Total Investors:</span> {selectedProperty.investmentCount || 0}</p>
                  <p><span className="font-medium">Funded:</span> {selectedProperty.fundingProgress || 0}%</p>
                  <p><span className="font-medium">Risk Level:</span> {selectedProperty.riskLevel || 'Medium'}</p>
                  <p><span className="font-medium">Term:</span> {selectedProperty.term || '5'} years</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700">{selectedProperty.description}</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={closeViewModal}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-primary-color text-white rounded-md hover:bg-primary-dark"
                onClick={() => {
                  closeViewModal();
                  handleEditProperty(selectedProperty);
                }}
              >
                Edit Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
import React, { useEffect, useState, useRef } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    type: 'residential',
    price: '',
    targetReturn: '',
    minimumInvestment: 100000, // Default ₦100,000
    term: 60, // 5 years in months
    status: 'Active',
    totalUnits: 10,
    availableUnits: 10
  });
  
  // File upload states
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [brochureFile, setBrochureFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  
  // Preview states
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState('');
  
  // Refs for file inputs
  const mainImageRef = useRef(null);
  const additionalImagesRef = useRef(null);
  const brochureRef = useRef(null);
  const videoRef = useRef(null);
  
  // For refreshing the property list after adding a new one
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setLoading(true);
    API.get('/admin/properties')
      .then(res => {
        setProperties(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching properties:', err);
        setError(err.response?.data?.message || 'Failed to load properties');
        setLoading(false);
      });
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  // Event handlers for form fields
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert numeric fields to numbers
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // File upload handlers
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setMainImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setAdditionalImages([...additionalImages, ...files]);
    
    // Create previews
    const newPreviews = [...additionalImagePreviews];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        setAdditionalImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleBrochureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBrochureFile(file);
  };
  
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid video file');
      return;
    }
    
    setVideoFile(file);
    
    // Create preview if possible
    if (URL.createObjectURL) {
      setVideoPreview(URL.createObjectURL(file));
    }
  };
  
  // Remove image from additional images
  const removeAdditionalImage = (index) => {
    const newImages = [...additionalImages];
    const newPreviews = [...additionalImagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setAdditionalImages(newImages);
    setAdditionalImagePreviews(newPreviews);
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      description: '',
      type: 'residential',
      price: '',
      targetReturn: '',
      minimumInvestment: 100000,
      term: 60,
      status: 'Active',
      totalUnits: 10,
      availableUnits: 10
    });
    
    // Reset file states
    setMainImage(null);
    setAdditionalImages([]);
    setBrochureFile(null);
    setVideoFile(null);
    
    // Reset previews
    setMainImagePreview('');
    setAdditionalImagePreviews([]);
    setVideoPreview('');
    
    // Reset file inputs
    if (mainImageRef.current) mainImageRef.current.value = "";
    if (additionalImagesRef.current) additionalImagesRef.current.value = "";
    if (brochureRef.current) brochureRef.current.value = "";
    if (videoRef.current) videoRef.current.value = "";
  };
  
  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.location || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (!mainImage) {
      toast.error('Please upload a main property image');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create FormData for file uploads
      const propertyData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        propertyData.append(key, formData[key]);
      });
      
      // Add files
      propertyData.append('mainImage', mainImage);
      
      // Add multiple files
      if (additionalImages.length > 0) {
        additionalImages.forEach((file, index) => {
          propertyData.append('additionalImages', file);
        });
      }
      
      if (brochureFile) {
        propertyData.append('brochure', brochureFile);
      }
      
      if (videoFile) {
        propertyData.append('video', videoFile);
      }
      
      // Send to API
      const response = await API.post('/admin/properties', propertyData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Success
      toast.success('Property added successfully');
      setShowAddForm(false);
      resetForm();
      
      // Refresh the property list
      setRefreshTrigger(prev => prev + 1);
      
    } catch (err) {
      console.error('Error adding property:', err);
      toast.error(err.response?.data?.message || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Property Management</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add New Property'}
        </button>
      </div>
      
      {showAddForm && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Property</h3>
          
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information Section */}
              <div className="col-span-2">
                <h4 className="text-lg font-medium mb-2 border-b pb-2">Basic Information</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Lagos, Abuja"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="mixed-use">Mixed-Use</option>
                    <option value="land">Land</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Return (%)
                  </label>
                  <input
                    type="text"
                    name="targetReturn"
                    value={formData.targetReturn}
                    onChange={handleChange}
                    placeholder="e.g., 12%"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Investment (₦)
                  </label>
                  <input
                    type="number"
                    name="minimumInvestment"
                    value={formData.minimumInvestment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                ></textarea>
              </div>
              
              {/* Investment Information Section */}
              <div className="col-span-2 mt-4">
                <h4 className="text-lg font-medium mb-2 border-b pb-2">Investment Information</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Term (Months)
                </label>
                <input
                  type="number"
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Active">Active</option>
                  <option value="Sold">Sold</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Construction">Under Construction</option>
                </select>
              </div>
              
              {/* Media Upload Section */}
              <div className="col-span-2 mt-4">
                <h4 className="text-lg font-medium mb-2 border-b pb-2">Media Files</h4>
              </div>
              
              {/* Main Image */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Property Image <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  ref={mainImageRef}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                {mainImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={mainImagePreview} 
                      alt="Main property preview" 
                      className="h-40 object-cover rounded-md border border-gray-300" 
                    />
                  </div>
                )}
              </div>
              
              {/* Additional Images */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                  ref={additionalImagesRef}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {additionalImagePreviews.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {additionalImagePreviews.map((preview, i) => (
                      <div key={i} className="relative">
                        <img 
                          src={preview} 
                          alt={`Additional preview ${i + 1}`} 
                          className="h-24 w-full object-cover rounded-md border border-gray-300" 
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Brochure Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Brochure (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleBrochureChange}
                  ref={brochureRef}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {brochureFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    File added: {brochureFile.name}
                  </div>
                )}
              </div>
              
              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Video
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  ref={videoRef}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {videoPreview && (
                  <div className="mt-2">
                    <video 
                      src={videoPreview} 
                      controls 
                      className="h-40 rounded-md border border-gray-300" 
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Property'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No properties found
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {property.imageUrl && (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img className="h-10 w-10 rounded-full object-cover" src={property.imageUrl} alt={property.name} />
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">{property.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₦{property.price?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        property.status === 'Sold' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => alert(`Edit property ${property.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => alert(`Delete property ${property.id}`)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagement;
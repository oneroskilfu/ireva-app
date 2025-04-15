import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/api';
import { isAuthenticated } from '../utils/auth';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);
  
  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const res = await propertyService.getPropertyById(id);
      setProperty(res.data);
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError('Failed to load property details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInvestClick = () => {
    if (!isAuthenticated()) {
      toast.info('Please sign in to invest in this property');
      navigate('/?redirect=' + encodeURIComponent(`/properties/${id}/invest`));
      return;
    }
    
    navigate(`/properties/${id}/invest`);
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error Loading Property</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/properties')}
            className="mt-4 px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/properties')}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isAuthenticated() && <Sidebar />}
      
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Property Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="relative h-80">
              <img 
                src={property.imageUrl || '/default-property.jpg'} 
                alt={property.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{property.location}</span>
                  </div>
                  <div className="flex space-x-4">
                    <span className="inline-flex items-center px-3 py-1 bg-blue-600 rounded-full text-sm font-medium text-white">
                      {property.type}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-green-600 rounded-full text-sm font-medium text-white">
                      {property.targetReturn}% Expected ROI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              className={`px-6 py-3 font-medium text-sm ${activeTab === 'overview' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${activeTab === 'financials' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('financials')}
            >
              Financials
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${activeTab === 'location' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('location')}
            >
              Location
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${activeTab === 'developer' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('developer')}
            >
              Developer
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${activeTab === 'documents' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-4">Property Overview</h2>
                  <p className="text-gray-700 mb-6">
                    {property.description}
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3">Property Features</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      <span>Property Type: {property.type}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>Term: {property.term} years</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>Minimum Investment: {formatCurrency(property.minimumInvestment)}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      <span>Expected ROI: {property.targetReturn}%</span>
                    </div>
                  </div>
                  
                  {property.amenities && (
                    <>
                      <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                      <ul className="grid grid-cols-2 gap-2 mb-6">
                        {property.amenities.split(',').map((amenity, index) => (
                          <li key={index} className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700">{amenity.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
              
              {activeTab === 'financials' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-4">Financial Details</h2>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Investment Terms</h3>
                      <p className="text-gray-600 mb-4">This property has a {property.term}-year investment term with {property.targetReturn}% expected annual return.</p>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Quarterly dividends</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">ROI Calculation</h3>
                      <p className="text-gray-600 mb-2">Example investment: {formatCurrency(property.minimumInvestment)}</p>
                      <p className="text-gray-600 mb-4">Annual return: {formatCurrency(property.minimumInvestment * (property.targetReturn / 100))}</p>
                      <p className="text-gray-600">Total return after {property.term} years: {formatCurrency(property.minimumInvestment * (1 + (property.targetReturn / 100 * property.term)))}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3">Funding Progress</h3>
                  <div className="mb-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Current Funding: {formatCurrency(property.currentFunding)}</span>
                      <span className="text-sm text-gray-600">Target: {formatCurrency(property.totalFunding)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-green-500 h-4 rounded-full" 
                        style={{ width: `${calculateProgress(property.currentFunding, property.totalFunding)}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 text-right">
                      {Math.round(calculateProgress(property.currentFunding, property.totalFunding))}% Funded
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3">Risk Assessment</h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Risk Rating</p>
                      <p className="font-semibold">{property.riskRating || 'Moderate'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Liquidity</p>
                      <p className="font-semibold">{property.liquidity || 'Medium'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Volatility</p>
                      <p className="font-semibold">{property.volatility || 'Low'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'location' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-4">Location Details</h2>
                  
                  <div className="mb-6">
                    <div className="bg-gray-200 h-64 w-full rounded-lg flex items-center justify-center mb-4">
                      <p className="text-gray-500">Map view would go here</p>
                    </div>
                    <p className="text-gray-700">
                      <strong>Address:</strong> {property.address || `${property.location}, Nigeria`}
                    </p>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3">Neighborhood Information</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      <div>
                        <p className="font-medium">Schools</p>
                        <p className="text-gray-600">Several schools within 2km radius</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium">Transportation</p>
                        <p className="text-gray-600">Bus stops and taxi stands nearby</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      <div>
                        <p className="font-medium">Shopping</p>
                        <p className="text-gray-600">Shopping centers within walking distance</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium">Dining</p>
                        <p className="text-gray-600">Multiple restaurants and cafes in the area</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3">Property Appreciation</h3>
                  <p className="text-gray-700 mb-4">
                    Properties in this area have appreciated by approximately 15% over the past 3 years, making it a valuable investment location with strong growth potential.
                  </p>
                </div>
              )}
              
              {activeTab === 'developer' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-4">Developer Information</h2>
                  
                  <div className="flex items-center mb-6">
                    <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{property.developerName || 'Premium Developers Ltd'}</h3>
                      <p className="text-gray-600">Established Real Estate Developer</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Developer Overview</h3>
                    <p className="text-gray-700 mb-4">
                      With over 15 years of experience in Nigeria's real estate market, Premium Developers has completed more than 25 successful projects across Lagos, Abuja, and Port Harcourt. The company specializes in residential and commercial developments with a focus on quality construction and sustainable design.
                    </p>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3">Track Record</h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">25+</p>
                      <p className="text-sm text-gray-600">Completed Projects</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">15+</p>
                      <p className="text-sm text-gray-600">Years Experience</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">98%</p>
                      <p className="text-sm text-gray-600">On-time Completion</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3">Notable Projects</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium">Lagos Heights Tower</h4>
                      <p className="text-gray-600">Completed in 2022 | 18-story commercial complex</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium">Greenville Estate, Abuja</h4>
                      <p className="text-gray-600">Completed in 2020 | 45-unit luxury residential community</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium">Riverside Mall, Port Harcourt</h4>
                      <p className="text-gray-600">Completed in 2021 | 12,000 sqm retail space</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'documents' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-4">Property Documents</h2>
                  
                  <p className="text-gray-700 mb-6">
                    Below are all the relevant documents for this property investment. Please review them carefully before investing.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="font-medium">Investment Prospectus</h3>
                        <p className="text-sm text-gray-500">PDF, 2.3 MB</p>
                      </div>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        Download
                      </button>
                    </div>
                    
                    <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="font-medium">Legal Documentation</h3>
                        <p className="text-sm text-gray-500">PDF, 1.8 MB</p>
                      </div>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        Download
                      </button>
                    </div>
                    
                    <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="font-medium">Financial Projections</h3>
                        <p className="text-sm text-gray-500">PDF, 3.5 MB</p>
                      </div>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        Download
                      </button>
                    </div>
                    
                    <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="font-medium">Floor Plans</h3>
                        <p className="text-sm text-gray-500">PDF, 5.2 MB</p>
                      </div>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Investment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                <h2 className="text-xl font-bold mb-4">Invest in this Property</h2>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">Minimum Investment</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(property.minimumInvestment)}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">Expected Annual Return</p>
                  <p className="text-2xl font-bold text-red-600">{property.targetReturn}%</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">Investment Term</p>
                  <p className="text-lg font-semibold">{property.term} years</p>
                </div>
                
                <div className="mb-6">
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
                
                <button 
                  onClick={handleInvestClick}
                  className="w-full py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors mb-4"
                >
                  Invest Now
                </button>
                
                <div className="text-center text-gray-500 text-sm">
                  {property.daysLeft > 0 ? (
                    <p>{property.daysLeft} days left to invest</p>
                  ) : (
                    <p>Limited slots available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
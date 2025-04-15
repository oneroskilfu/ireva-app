import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService, investmentService } from '../services/api';
import { isAuthenticated, getCurrentUser } from '../utils/auth';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const PropertyInvestment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [calculatedReturns, setCalculatedReturns] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const user = getCurrentUser();
  
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to invest in properties');
      navigate('/?redirect=' + encodeURIComponent(`/properties/${id}/invest`));
      return;
    }
    
    fetchPropertyDetails();
  }, [id]);
  
  useEffect(() => {
    if (property && investmentAmount && !isNaN(investmentAmount)) {
      calculateReturns(Number(investmentAmount));
    } else {
      setCalculatedReturns(null);
    }
  }, [property, investmentAmount]);
  
  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      // Mock property data for demonstration
      const mockProperties = [
        {
          id: 1,
          name: "Lagos Heights Residences",
          description: "Luxury apartment complex in the heart of Lagos, featuring modern amenities and stunning ocean views. Perfect for investors looking for high rental yields.",
          location: "Lagos",
          type: "residential",
          imageUrl: "https://images.unsplash.com/photo-1614846384571-1e31e9d9ec2b?q=80&w=800&auto=format&fit=crop",
          targetReturn: "18",
          minimumInvestment: 500000,
          term: 5,
          totalFunding: 200000000,
          currentFunding: 120000000,
          daysLeft: 15
        },
        {
          id: 2,
          name: "Abuja Commercial Plaza",
          description: "Prime commercial property in the central business district of Abuja. Features office spaces, retail outlets, and ample parking. High occupancy rate expected.",
          location: "Abuja",
          type: "commercial",
          imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
          targetReturn: "22",
          minimumInvestment: 1000000,
          term: 7,
          totalFunding: 350000000,
          currentFunding: 200000000,
          daysLeft: 30
        },
        {
          id: 3,
          name: "Port Harcourt Industrial Park",
          description: "Strategic industrial development near Port Harcourt's shipping terminals. Ideal for logistics, manufacturing, and warehouse operations with excellent infrastructure.",
          location: "Port Harcourt",
          type: "industrial",
          imageUrl: "https://images.unsplash.com/photo-1629136335402-4ad21a7fb08f?q=80&w=800&auto=format&fit=crop",
          targetReturn: "20",
          minimumInvestment: 2000000,
          term: 10,
          totalFunding: 500000000,
          currentFunding: 250000000,
          daysLeft: 45
        },
        {
          id: 4,
          name: "Ibadan Green Estates",
          description: "Eco-friendly residential community in the outskirts of Ibadan. Features solar power, water recycling systems, and community gardens. Growing demand for sustainable housing.",
          location: "Ibadan",
          type: "residential",
          imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop",
          targetReturn: "16",
          minimumInvestment: 300000,
          term: 5,
          totalFunding: 150000000,
          currentFunding: 90000000,
          daysLeft: 20
        },
        {
          id: 5,
          name: "Lagos Retail Hub",
          description: "Modern shopping center in a high-traffic area of Lagos. Multiple established tenants already secured with long-term leases, ensuring steady income.",
          location: "Lagos",
          type: "commercial",
          imageUrl: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=800&auto=format&fit=crop",
          targetReturn: "19",
          minimumInvestment: 750000,
          term: 6,
          totalFunding: 250000000,
          currentFunding: 175000000,
          daysLeft: 25
        },
        {
          id: 6,
          name: "Abuja Mixed-Use Development",
          description: "Innovative mixed-use project combining residential apartments, office spaces, and retail outlets in one integrated complex. Located in rapidly developing area of Abuja.",
          location: "Abuja",
          type: "mixed-use",
          imageUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800&auto=format&fit=crop",
          targetReturn: "21",
          minimumInvestment: 1500000,
          term: 8,
          totalFunding: 400000000,
          currentFunding: 180000000,
          daysLeft: 40
        }
      ];

      // Find the property by ID
      const foundProperty = mockProperties.find(prop => prop.id.toString() === id.toString());
      
      if (foundProperty) {
        setProperty(foundProperty);
        setInvestmentAmount(foundProperty.minimumInvestment.toString());
      } else {
        setError('Property not found');
      }
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError('Failed to load property details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const calculateReturns = (amount) => {
    if (!property) return;
    
    const annualReturn = amount * (property.targetReturn / 100);
    const totalReturn = amount + (annualReturn * property.term);
    const quarterlyDividend = annualReturn / 4;
    
    setCalculatedReturns({
      investmentAmount: amount,
      annualReturn,
      totalReturn,
      quarterlyDividend,
      roi: property.targetReturn
    });
  };
  
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setInvestmentAmount(value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!property) return;
    
    const amount = Number(investmentAmount);
    
    // Validation
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid investment amount');
      return;
    }
    
    if (amount < property.minimumInvestment) {
      toast.error(`Minimum investment amount is ${formatCurrency(property.minimumInvestment)}`);
      return;
    }
    
    if (paymentMethod === 'wallet' && user?.walletBalance < amount) {
      toast.error('Insufficient wallet balance. Please add funds or choose another payment method.');
      return;
    }
    
    setProcessingPayment(true);
    
    // Simulate processing delay
    setTimeout(() => {
      try {
        toast.success('Investment successful!');
        
        // Mock investment ID
        const mockInvestmentId = Math.floor(Math.random() * 1000) + 1;
        
        // Redirect to investment confirmation page
        navigate(`/investments/${mockInvestmentId}/success`);
      } catch (err) {
        console.error('Investment error:', err);
        toast.error('Failed to process investment. Please try again.');
      } finally {
        setProcessingPayment(false);
      }
    }, 2000); // Simulate 2-second processing time
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
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
          <h2 className="text-xl font-bold mb-2">Error</h2>
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
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invest in {property.name}</h1>
            <p className="text-gray-600">Complete your investment details below</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Investment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold mb-4">Investment Details</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Investment Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₦</span>
                      </div>
                      <input
                        type="number"
                        id="investmentAmount"
                        name="investmentAmount"
                        min={property.minimumInvestment}
                        step="1000"
                        value={investmentAmount}
                        onChange={handleAmountChange}
                        className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Minimum investment: {formatCurrency(property.minimumInvestment)}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-md p-4 cursor-pointer ${paymentMethod === 'wallet' ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        onClick={() => setPaymentMethod('wallet')}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="wallet"
                            name="paymentMethod"
                            value="wallet"
                            checked={paymentMethod === 'wallet'}
                            onChange={() => setPaymentMethod('wallet')}
                            className="h-4 w-4 text-red-600 focus:ring-red-500"
                          />
                          <label htmlFor="wallet" className="ml-2 block text-sm font-medium text-gray-700">
                            Wallet Balance
                          </label>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Available: {formatCurrency(user?.walletBalance || 0)}
                        </p>
                      </div>
                      
                      <div 
                        className={`border rounded-md p-4 cursor-pointer ${paymentMethod === 'card' ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="card"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                            className="h-4 w-4 text-red-600 focus:ring-red-500"
                          />
                          <label htmlFor="card" className="ml-2 block text-sm font-medium text-gray-700">
                            Credit/Debit Card
                          </label>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Pay securely with your card
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {calculatedReturns && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-md">
                      <h3 className="text-md font-semibold mb-2">Investment Summary</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-sm text-gray-500">Investment Amount</p>
                          <p className="font-medium">{formatCurrency(calculatedReturns.investmentAmount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Annual Return ({calculatedReturns.roi}%)</p>
                          <p className="font-medium">{formatCurrency(calculatedReturns.annualReturn)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Quarterly Dividend</p>
                          <p className="font-medium">{formatCurrency(calculatedReturns.quarterlyDividend)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Return (after {property.term} years)</p>
                          <p className="font-medium">{formatCurrency(calculatedReturns.totalReturn)}</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        * Returns are projections based on historical performance. Actual returns may vary.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center mb-6">
                    <input
                      type="checkbox"
                      id="termsAgreement"
                      name="termsAgreement"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="termsAgreement" className="ml-2 block text-sm text-gray-700">
                      I agree to the <a href="#" className="text-red-600 hover:underline">Terms and Conditions</a> and have read the <a href="#" className="text-red-600 hover:underline">Investment Prospectus</a>
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className="w-full py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {processingPayment ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Complete Investment'
                    )}
                  </button>
                </form>
              </div>
            </div>
            
            {/* Property Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                <h2 className="text-lg font-bold mb-4">Property Summary</h2>
                
                <div className="mb-4">
                  <img 
                    src={property.imageUrl || '/default-property.jpg'} 
                    alt={property.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-semibold">{property.name}</h3>
                  <p className="text-gray-600 text-sm">{property.location}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-medium">{property.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Returns</span>
                    <span className="font-medium text-red-600">{property.targetReturn}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investment Term</span>
                    <span className="font-medium">{property.term} years</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Have questions about investing?</p>
                  <a href="#" className="text-red-600 text-sm font-medium hover:underline">Contact our investment advisors</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyInvestment;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { investmentService } from '../services/api';
import Sidebar from '../components/Sidebar';

const InvestmentSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchInvestmentDetails();
  }, [id]);
  
  const fetchInvestmentDetails = async () => {
    setLoading(true);
    try {
      const res = await investmentService.getInvestmentById(id);
      setInvestment(res.data);
    } catch (err) {
      console.error('Error fetching investment details:', err);
      setError('Failed to load investment details. Please check your investment history.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-NG', options);
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
            onClick={() => navigate('/history')}
            className="mt-4 px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700"
          >
            Go to Investment History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Investment Successful!</h1>
              <p className="text-gray-600">
                Your investment in {investment?.property?.name || 'this property'} has been processed successfully.
              </p>
            </div>
            
            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Investment ID</p>
                  <p className="font-medium">{investment?.id || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{investment?.createdAt ? formatDate(investment.createdAt) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Investment Amount</p>
                  <p className="font-medium">{formatCurrency(investment?.amount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{investment?.paymentMethod || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Annual Return</p>
                  <p className="font-medium text-green-600">
                    {investment?.property?.targetReturn 
                      ? `${investment.property.targetReturn}% (${formatCurrency(investment.amount * (investment.property.targetReturn / 100))})`
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Investment Term</p>
                  <p className="font-medium">{investment?.property?.term ? `${investment.property.term} years` : '-'}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">What Happens Next?</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>You'll receive a confirmation email with your investment details.</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Your investment will be visible in your dashboard under "My Investments".</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Quarterly dividends will be paid directly to your wallet, starting in 3 months.</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>You'll receive regular updates about the property and its performance.</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Link 
                to="/history"
                className="flex-1 px-4 py-3 bg-red-600 text-white text-center font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                View My Investments
              </Link>
              <Link 
                to="/properties"
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 text-center font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Browse More Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSuccess;
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminROITracker() {
  const [roiData, setRoiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('distributions');

  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin/roi-summary')
      .then(res => {
        // The API returns a complex object with multiple data sections
        // We'll use the recentDistributions for our data table
        if (res.data && res.data.recentDistributions) {
          setRoiData(res.data.recentDistributions);
        } else {
          // Fallback to the entire response if structure is different
          setRoiData(Array.isArray(res.data) ? res.data : []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching ROI data:', err);
        setLoading(false);
      });
  }, []);

  const handleAddDistribution = () => {
    alert('Navigate to create ROI distribution form');
  };

  const handleProcessPayment = (distribution) => {
    if (!distribution || !distribution.id) {
      alert('Invalid distribution data');
      return;
    }
    
    setLoading(true);
    axios.post(`/api/admin/roi-distributions/${distribution.id}/process`)
      .then(res => {
        alert(`Distribution processed successfully. ${res.data.transactionsCreated} transactions created.`);
        
        // Refresh the data after processing
        axios.get('/api/admin/roi-summary')
          .then(res => {
            if (res.data && res.data.recentDistributions) {
              setRoiData(res.data.recentDistributions);
            } else {
              setRoiData(Array.isArray(res.data) ? res.data : []);
            }
            setLoading(false);
          })
          .catch(err => {
            console.error('Error refreshing ROI data:', err);
            setLoading(false);
          });
      })
      .catch(err => {
        console.error('Error processing distribution:', err);
        alert(`Error processing distribution: ${err.response?.data?.message || err.message}`);
        setLoading(false);
      });
  };

  const renderTab = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      );
    }

    if (activeTab === 'distributions') {
      return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roiData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No ROI distributions found
                    </td>
                  </tr>
                ) : (
                  roiData.map((roi, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{roi.projectTitle}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₦{roi.amount?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {roi.roiPercentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(roi.payoutDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          roi.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          roi.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                          roi.status === 'Failed' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {roi.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className={`text-indigo-600 hover:text-indigo-900 mr-3 ${roi.status === 'Completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleProcessPayment(i)}
                          disabled={roi.status === 'Completed'}
                        >
                          Process
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => alert(`View details for distribution ${i}`)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (activeTab === 'transactions') {
      return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roiData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No ROI transactions found
                    </td>
                  </tr>
                ) : (
                  roiData.map((roi, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{roi.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {roi.projectTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Distribution #{i+1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          ₦{roi.amount?.toLocaleString() || '0'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(roi.payoutDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-white shadow-md rounded-lg p-8">
          <h3 className="text-xl font-bold mb-4">ROI Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 p-4 rounded-md shadow-sm">
              <h4 className="font-medium text-lg">Total Distributions</h4>
              <p className="text-2xl font-bold text-green-600">{roiData.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md shadow-sm">
              <h4 className="font-medium text-lg">Total Amount Distributed</h4>
              <p className="text-2xl font-bold text-blue-600">
                ₦{roiData.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-md shadow-sm">
              <h4 className="font-medium text-lg">Average ROI</h4>
              <p className="text-2xl font-bold text-purple-600">
                {(roiData.reduce((sum, item) => sum + (item.roiPercentage || 0), 0) / (roiData.length || 1)).toFixed(2)}%
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Distribution Status</h3>
            <div className="h-8 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="flex h-full">
                <div className="bg-green-500 h-full" style={{ width: '65%' }} title="Completed"></div>
                <div className="bg-blue-500 h-full" style={{ width: '20%' }} title="Processing"></div>
                <div className="bg-yellow-500 h-full" style={{ width: '10%' }} title="Pending"></div>
                <div className="bg-red-500 h-full" style={{ width: '5%' }} title="Failed"></div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Completed (65%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                <span>Processing (20%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span>Pending (10%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span>Failed (5%)</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">ROI Tracking</h2>
        {activeTab === 'distributions' && (
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            onClick={handleAddDistribution}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Distribution
          </button>
        )}
      </div>
      
      <div className="mb-6 border-b">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'distributions'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('distributions')}
          >
            Distributions
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
        </nav>
      </div>
      
      {renderTab()}
    </div>
  );
}
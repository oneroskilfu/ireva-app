import React, { useEffect, useState } from 'react';
import API from '../../api/axios';

const RoiTracker = () => {
  const [roiData, setRoiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    setLoading(true);
    API.get('/admin/roi-summary')
      .then(res => {
        if (res.data && res.data.recentDistributions) {
          setRoiData(res.data.recentDistributions);
        } else {
          setRoiData(Array.isArray(res.data) ? res.data : []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching ROI data:', err);
        setError(err.response?.data?.message || 'Failed to load ROI data');
        setLoading(false);
      });
  }, []);

  const handleExportData = () => {
    // In a real implementation, this would generate a CSV or Excel file
    alert('Exporting ROI data...');
  };

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

  // Calculate some summary statistics
  const totalAmount = roiData.reduce((sum, item) => sum + (item.amount || 0), 0);
  const averageROI = roiData.length 
    ? (roiData.reduce((sum, item) => sum + (item.roiPercentage || 0), 0) / roiData.length).toFixed(2)
    : 0;
  
  const renderSummaryTab = () => (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 p-4 rounded-md shadow-sm">
          <h4 className="font-medium text-lg">Total Distributions</h4>
          <p className="text-2xl font-bold text-green-600">{roiData.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-md shadow-sm">
          <h4 className="font-medium text-lg">Total Amount</h4>
          <p className="text-2xl font-bold text-blue-600">₦{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-md shadow-sm">
          <h4 className="font-medium text-lg">Average ROI</h4>
          <p className="text-2xl font-bold text-purple-600">{averageROI}%</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Recent ROI Distributions</h3>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roiData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No ROI distributions found
                    </td>
                  </tr>
                ) : (
                  roiData.slice(0, 5).map((roi, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{roi.projectTitle}</div>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDistributionsTab = () => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-between p-4 border-b">
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Search distributions..." 
            className="border rounded px-2 py-1 text-sm"
          />
          <select className="border rounded px-2 py-1 text-sm">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <button 
          onClick={handleExportData}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
        >
          Export
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roiData.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No ROI distributions found
                </td>
              </tr>
            ) : (
              roiData.map((roi, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{roi.projectTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {roi.userEmail || 'Multiple Users'}
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
                      disabled={roi.status === 'Completed'}
                    >
                      Process
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-900"
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">ROI Tracking</h2>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Distribution
        </button>
      </div>
      
      <div className="mb-6 border-b">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'summary'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
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
              activeTab === 'analytics'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>
      </div>
      
      {activeTab === 'summary' && renderSummaryTab()}
      {activeTab === 'distributions' && renderDistributionsTab()}
      {activeTab === 'analytics' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">ROI Analytics Coming Soon</h3>
          <p className="text-gray-600">
            This section will include charts and graphs to visualize ROI performance over time.
          </p>
        </div>
      )}
    </div>
  );
};

export default RoiTracker;
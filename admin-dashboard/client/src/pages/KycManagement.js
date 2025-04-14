import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiShield, FiAlertTriangle } from 'react-icons/fi';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const KycManagement = () => {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const fetchKycRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/kyc');
      setKycRequests(res.data);
    } catch (err) {
      console.error("Error fetching KYC requests:", err);
      setError('Failed to load KYC requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/kyc/${userId}/approve`);
      
      // Update the local state to remove the approved user
      setKycRequests(prevRequests => prevRequests.filter(user => user._id !== userId));
      
      setSuccessMessage('KYC request approved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Error approving KYC request:", err);
      setError('Failed to approve the KYC request. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectionModal = (userId) => {
    setSelectedUserId(userId);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const closeRejectionModal = () => {
    setShowRejectionModal(false);
    setSelectedUserId(null);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required.');
      return;
    }

    try {
      setActionLoading(true);
      await api.put(`/admin/kyc/${selectedUserId}/reject`, { rejectionReason });
      
      // Update the local state to remove the rejected user
      setKycRequests(prevRequests => prevRequests.filter(user => user._id !== selectedUserId));
      
      closeRejectionModal();
      setSuccessMessage('KYC request rejected successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Error rejecting KYC request:", err);
      setError('Failed to reject the KYC request. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">KYC Management</h1>
        <p className="text-gray-600">Review and approve identity verification requests</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
          <FiAlertTriangle className="mr-2" size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
          <FiCheck className="mr-2" size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Pending Verifications</h2>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
            {kycRequests.length} pending
          </span>
        </div>

        {kycRequests.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <FiShield size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Pending KYC Requests</h3>
            <p className="text-gray-500">All verification requests have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 border-b">User</th>
                  <th className="text-left px-4 py-3 border-b">Email</th>
                  <th className="text-left px-4 py-3 border-b">Phone</th>
                  <th className="text-left px-4 py-3 border-b">Submitted On</th>
                  <th className="text-left px-4 py-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {kycRequests.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b">{user.name}</td>
                    <td className="px-4 py-3 border-b">{user.email}</td>
                    <td className="px-4 py-3 border-b">{user.phone}</td>
                    <td className="px-4 py-3 border-b">
                      {new Date(user.createdAt).toLocaleDateString('en-NG')}
                    </td>
                    <td className="px-4 py-3 border-b">
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                          onClick={() => handleApprove(user._id)}
                          disabled={actionLoading}
                          title="Approve"
                        >
                          <FiCheck size={18} />
                        </button>
                        <button 
                          className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                          onClick={() => openRejectionModal(user._id)}
                          disabled={actionLoading}
                          title="Reject"
                        >
                          <FiX size={18} />
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

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Reject KYC Verification</h3>
            <p className="mb-4 text-gray-600">
              Please provide a reason for rejecting this KYC request. This will be sent to the user.
            </p>
            
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              rows={4}
              placeholder="Enter rejection reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={closeRejectionModal}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycManagement;
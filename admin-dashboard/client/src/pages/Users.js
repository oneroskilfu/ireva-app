import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiUserCheck, FiUserX, FiFilter } from 'react-icons/fi';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, verified, unverified
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const USERS_PER_PAGE = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // In a real app, you would use query parameters for pagination and filtering
      const res = await api.get('/users');
      
      // Apply filters based on filterType
      let filteredUsers = res.data;
      if (filterType === 'verified') {
        filteredUsers = res.data.filter(user => user.isKYCApproved);
      } else if (filterType === 'unverified') {
        filteredUsers = res.data.filter(user => !user.isKYCApproved);
      }
      
      // Set total pages based on filtered results
      setTotalPages(Math.ceil(filteredUsers.length / USERS_PER_PAGE));
      
      // Paginate the results
      const startIndex = (currentPage - 1) * USERS_PER_PAGE;
      const endIndex = startIndex + USERS_PER_PAGE;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      setUsers(paginatedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, you would send the search term to the API
    // For now, we'll filter the loaded users
    fetchUsers();
  };

  const filterUsers = (filter) => {
    setFilterType(filter);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      await api.delete(`/users/${selectedUser._id}`);
      
      // Update the local state to remove the deleted user
      setUsers(prevUsers => prevUsers.filter(user => user._id !== selectedUser._id));
      
      closeDeleteModal();
      setSuccessMessage('User deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError('Failed to delete the user. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  const filteredUsers = searchTerm 
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
      )
    : users;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">User Management</h1>
        <p className="text-gray-600">Manage registered users on the platform</p>
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
        <div className="flex flex-col md:flex-row justify-between mb-4">
          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
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
          <div className="flex space-x-2">
            <button
              className={`px-3 py-2 rounded-md flex items-center text-sm ${
                filterType === 'all' 
                  ? 'bg-primary-color text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => filterUsers('all')}
            >
              <FiFilter className="mr-2" />
              All Users
            </button>
            <button
              className={`px-3 py-2 rounded-md flex items-center text-sm ${
                filterType === 'verified' 
                  ? 'bg-success-color text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => filterUsers('verified')}
            >
              <FiUserCheck className="mr-2" />
              Verified
            </button>
            <button
              className={`px-3 py-2 rounded-md flex items-center text-sm ${
                filterType === 'unverified' 
                  ? 'bg-warning-color text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => filterUsers('unverified')}
            >
              <FiUserX className="mr-2" />
              Unverified
            </button>
          </div>
        </div>

        {/* Users table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 border-b">Name</th>
                <th className="text-left px-4 py-3 border-b">Email</th>
                <th className="text-left px-4 py-3 border-b">Phone</th>
                <th className="text-left px-4 py-3 border-b">KYC Status</th>
                <th className="text-left px-4 py-3 border-b">Registered</th>
                <th className="text-left px-4 py-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b">{user.email}</td>
                    <td className="px-4 py-3 border-b">{user.phone || 'N/A'}</td>
                    <td className="px-4 py-3 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isKYCApproved 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.isKYCApproved ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b">
                      {new Date(user.createdAt).toLocaleDateString('en-NG')}
                    </td>
                    <td className="px-4 py-3 border-b">
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                          title="Edit User"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button 
                          className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                          onClick={() => openDeleteModal(user)}
                          title="Delete User"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div>
              <span className="text-sm text-gray-600">
                Showing {(currentPage - 1) * USERS_PER_PAGE + 1} to {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the user <strong>{selectedUser?.name}</strong>? This action cannot be undone.
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
                onClick={handleDeleteUser}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
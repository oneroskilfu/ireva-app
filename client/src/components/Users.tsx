import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, UserPlus, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';

interface User {
  _id?: string;
  id?: number;
  username: string;
  email: string;
  fullName?: string;
  role: string;
  kycVerified?: boolean;
  mfaEnabled?: boolean;
  createdAt?: string;
  walletBalance?: number;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [role, setRole] = useState('');
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
      setLoading(false);
    }
  };

  const changeUserRole = async (userId: string | number, newRole: string) => {
    try {
      await axios.put(`/api/users/role/${userId}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast({
        title: 'Role Updated',
        description: `User role has been updated to ${newRole}`,
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update user role',
        variant: 'destructive'
      });
    }
  };

  const deleteUser = async (userId: string | number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast({
        title: 'User Deleted',
        description: 'The user has been successfully deleted',
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = role === '' || user.role === role;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl ml-72">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button 
          onClick={() => fetchUsers()}
          className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded flex items-center"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : ''}
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4"
                placeholder="Search users by name, email, or username..."
              />
            </div>
            
            <div className="w-full md:w-48">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-4"
              >
                <option value="">All Roles</option>
                <option value="investor">Investor</option>
                <option value="admin">Admin</option>
                <option value="projectOwner">Project Owner</option>
              </select>
            </div>
            
            <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Add User
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users found. Try adjusting your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName || user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => changeUserRole(user._id || user.id!, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="investor">Investor</option>
                        <option value="admin">Admin</option>
                        <option value="projectOwner">Project Owner</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.kycVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          KYC: {user.kycVerified ? 'Verified' : 'Pending'}
                        </span>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.mfaEnabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          MFA: {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ₦{user.walletBalance?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-gray-600 hover:text-gray-900">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => deleteUser(user._id || user.id!)}
                        >
                          <Trash2 className="h-5 w-5" />
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
    </div>
  );
};

export default Users;
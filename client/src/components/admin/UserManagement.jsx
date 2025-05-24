import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useToast } from '../../hooks/use-toast';
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/DesignSystem';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const UserManagement = () => {
  const api = useApiRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'investor',
    phone: '',
    address: '',
  });
  
  // Build query params
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    if (searchTerm) params.append('search', searchTerm);
    if (roleFilter) params.append('role', roleFilter);
    if (kycFilter) params.append('kycStatus', kycFilter);
    
    return params.toString();
  };
  
  // Fetch users
  const { 
    data: usersData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/admin/users?${buildQueryParams()}`],
    queryFn: async () => {
      const response = await api.get(`admin/users?${buildQueryParams()}`);
      return response.data.data;
    },
    refetchOnWindowFocus: false,
  });
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await api.post('admin/users', userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/admin/users']);
      setIsCreateModalOpen(false);
      resetForm();
      
      toast({
        title: 'User created',
        description: 'The user has been created successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }) => {
      const response = await api.patch(`admin/users/${userId}`, userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/admin/users']);
      setIsEditModalOpen(false);
      
      toast({
        title: 'User updated',
        description: 'The user has been updated successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await api.delete(`admin/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/admin/users']);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      
      toast({
        title: 'User deleted',
        description: 'The user has been deleted successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });
  
  // Reset form
  const resetForm = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'investor',
      phone: '',
      address: '',
    });
  };
  
  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle create user
  const handleCreateUser = (e) => {
    e.preventDefault();
    
    // Validate form
    if (userForm.password !== userForm.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Password and confirm password do not match',
        variant: 'destructive',
      });
      return;
    }
    
    // Submit form
    createUserMutation.mutate({
      name: userForm.name,
      email: userForm.email,
      password: userForm.password,
      role: userForm.role,
      phone: userForm.phone || undefined,
      address: userForm.address || undefined,
    });
  };
  
  // Handle edit user
  const handleEditUser = (e) => {
    e.preventDefault();
    
    // Validate form
    if (userForm.password && userForm.password !== userForm.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Password and confirm password do not match',
        variant: 'destructive',
      });
      return;
    }
    
    // Prepare data (only include password if it was changed)
    const userData = {
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      phone: userForm.phone || null,
      address: userForm.address || null,
    };
    
    if (userForm.password) {
      userData.password = userForm.password;
    }
    
    // Submit form
    updateUserMutation.mutate({
      userId: selectedUser.id,
      userData
    });
  };
  
  // Handle delete user
  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };
  
  // Open edit user modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      role: user.role || 'investor',
      phone: user.phone || '',
      address: user.address || '',
    });
    setIsEditModalOpen(true);
  };
  
  // Open delete user modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setKycFilter('');
    setPage(1);
  };
  
  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page !== 1) setPage(1);
      else refetch();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, kycFilter]);
  
  return (
    <div>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">User Management</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
                {(roleFilter || kycFilter) && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {(roleFilter ? 1 : 0) + (kycFilter ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              
              <Button 
                onClick={refetch} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button 
                onClick={() => {
                  resetForm();
                  setIsCreateModalOpen(true);
                }}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add User
              </Button>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-grow">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setSearchTerm('')}
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md mb-4">
                <div>
                  <Label htmlFor="role-filter">Role</Label>
                  <Select
                    id="role-filter"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="mt-1"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="investor">Investor</option>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="kyc-filter">KYC Status</Label>
                  <Select
                    id="kyc-filter"
                    value={kycFilter}
                    onChange={(e) => setKycFilter(e.target.value)}
                    className="mt-1"
                  >
                    <option value="">All Statuses</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="not_started">Not Started</option>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="ghost" 
                    onClick={resetFilters}
                    disabled={!roleFilter && !kycFilter && !searchTerm}
                    className="mt-1"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">KYC Status</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Created</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center p-4">
                      <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="text-center p-4 text-red-600">
                      Failed to load users. {error.message}
                    </td>
                  </tr>
                ) : usersData?.users?.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-4 text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  usersData?.users?.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{user.name || '-'}</div>
                      </td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <Badge variant={
                          user.role === 'admin' ? 'default' : 
                          user.role === 'manager' ? 'secondary' : 
                          'outline'
                        }>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={
                          user.kycStatus === 'verified' ? 'success' : 
                          user.kycStatus === 'pending' ? 'warning' : 
                          user.kycStatus === 'rejected' ? 'destructive' : 
                          'default'
                        }>
                          {user.kycStatus?.charAt(0).toUpperCase() + user.kycStatus?.slice(1) || 'Not Started'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={user.isActive ? 'success' : 'destructive'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditModal(user)}
                            title="Edit User"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.location.href = `/admin/users/${user.id}`}
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDeleteModal(user)}
                            title="Delete User"
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {usersData?.pagination && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, usersData.pagination.totalItems)} of {usersData.pagination.totalItems} users
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, usersData.pagination.totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNumber;
                  if (usersData.pagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (page <= 3) {
                    pageNumber = i + 1;
                  } else if (page >= usersData.pagination.totalPages - 2) {
                    pageNumber = usersData.pagination.totalPages - 4 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }
                  
                  if (pageNumber < 1 || pageNumber > usersData.pagination.totalPages) {
                    return null;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={page === pageNumber ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="outline"
                  size="sm"
                  disabled={page === usersData.pagination.totalPages}
                  onClick={() => setPage(p => Math.min(usersData.pagination.totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <Select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-16"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the platform. They'll receive an email with their login details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    name="name"
                    value={userForm.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <div className="col-span-3">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userForm.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <div className="col-span-3">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={userForm.password}
                    onChange={handleFormChange}
                    required
                    minLength={8}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword" className="text-right">
                  Confirm
                </Label>
                <div className="col-span-3">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={userForm.confirmPassword}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <div className="col-span-3">
                  <Select
                    id="role"
                    name="role"
                    value={userForm.role}
                    onChange={handleFormChange}
                  >
                    <option value="investor">Investor</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <div className="col-span-3">
                  <Input
                    id="phone"
                    name="phone"
                    value={userForm.phone}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <div className="col-span-3">
                  <Input
                    id="address"
                    name="address"
                    value={userForm.address}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-name"
                    name="name"
                    value={userForm.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={userForm.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-password" className="text-right">
                  Password
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-password"
                    name="password"
                    type="password"
                    value={userForm.password}
                    onChange={handleFormChange}
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-confirmPassword" className="text-right">
                  Confirm
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={userForm.confirmPassword}
                    onChange={handleFormChange}
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <div className="col-span-3">
                  <Select
                    id="edit-role"
                    name="role"
                    value={userForm.role}
                    onChange={handleFormChange}
                  >
                    <option value="investor">Investor</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-phone"
                    name="phone"
                    value={userForm.phone}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-address" className="text-right">
                  Address
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-address"
                    name="address"
                    value={userForm.address}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded mb-4">
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
              </div>
              
              <p className="text-red-600 text-sm">
                Warning: Deleting this user will remove all their associated data including investments, transactions, and documents.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
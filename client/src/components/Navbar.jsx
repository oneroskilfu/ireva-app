import React from 'react';

const Navbar = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-red-600 font-bold text-2xl">i</span>
              <span className="text-gray-800 font-bold text-2xl">REVA</span>
              <span className="ml-2 text-gray-600 font-medium">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/admin/properties'}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Properties
            </button>
            <button
              onClick={() => window.location.href = '/admin/roi'}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              ROI Tracker
            </button>
            <button
              onClick={() => window.location.href = '/admin/users'}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Users
            </button>
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
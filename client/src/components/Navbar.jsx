import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const userRole = getUserRole();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to={userRole === 'admin' ? '/admin' : '/investor'} className="flex items-center">
                <span className="text-red-600 font-bold text-2xl">i</span>
                <span className="text-gray-800 font-bold text-2xl">REVA</span>
                {userRole === 'admin' && (
                  <span className="ml-2 text-gray-600 font-medium">Admin Dashboard</span>
                )}
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {userRole === 'admin' ? (
              <>
                <Link 
                  to="/admin/properties"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Properties
                </Link>
                <Link 
                  to="/admin/roi"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  ROI Tracker
                </Link>
                <Link 
                  to="/admin/users"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Users
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/investor"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Dashboard
                </Link>
              </>
            )}
            <Link 
              to="/messages"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Messages
            </Link>
            <Link 
              to="/history"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Investments
            </Link>
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
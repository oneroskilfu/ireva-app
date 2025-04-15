import React from 'react';
import { Link } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const Sidebar = () => {
  const userRole = getUserRole();
  const isAdmin = userRole === 'admin';
  
  return (
    <div className="bg-white shadow-md w-64 min-h-screen p-4">
      <div className="flex items-center mb-8">
        <div className="flex-shrink-0 flex items-center">
          <span className="text-red-600 font-bold text-2xl">i</span>
          <span className="text-gray-800 font-bold text-2xl">REVA</span>
        </div>
      </div>
      
      <nav>
        <ul className="space-y-2">
          <li>
            <Link 
              to={isAdmin ? "/admin" : "/investor"}
              className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
            >
              Dashboard
            </Link>
          </li>
          
          {isAdmin && (
            <>
              <li>
                <Link 
                  to="/admin/properties"
                  className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/roi"
                  className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                >
                  ROI Tracker
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/users"
                  className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                >
                  Users
                </Link>
              </li>
            </>
          )}
          
          <li>
            <Link 
              to="/messages"
              className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
            >
              Messages
            </Link>
          </li>
          
          <li>
            <Link 
              to="/history"
              className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
            >
              Investment History
            </Link>
          </li>
          
          {/* User settings section */}
          <li className="pt-4 mt-4 border-t border-gray-200">
            <Link 
              to={isAdmin ? "/admin/profile" : "/profile"}
              className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
            >
              Profile
            </Link>
          </li>
          
          <li>
            <Link 
              to={isAdmin ? "/admin/kyc" : "/kyc"}
              className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
            >
              KYC Verification
            </Link>
          </li>
          
          <li>
            <Link 
              to={isAdmin ? "/admin/settings" : "/settings"}
              className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md"
            >
              Settings
            </Link>
          </li>
          
          <li className="pt-4 mt-4">
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/';
              }}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium rounded-md"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
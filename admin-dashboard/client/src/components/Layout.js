import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiGrid,
  FiDollarSign, 
  FiShield, 
  FiCodepen,
  FiFolder,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser
} from 'react-icons/fi';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FiHome size={20} /> },
    { name: 'Users', path: '/users', icon: <FiUsers size={20} /> },
    { name: 'Properties', path: '/properties', icon: <FiGrid size={20} /> },
    { name: 'Investments', path: '/investments', icon: <FiDollarSign size={20} /> },
    { name: 'KYC Management', path: '/kyc', icon: <FiShield size={20} /> },
    { name: 'Developers', path: '/developers', icon: <FiCodepen size={20} /> },
    { name: 'Projects', path: '/projects', icon: <FiFolder size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div 
        className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" 
        style={{ display: sidebarOpen ? 'block' : 'none' }}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 transform bg-white border-r lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and close button (mobile) */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary-color">REVA</span>
            <span className="ml-2 text-sm font-medium">Admin</span>
          </div>
          <button 
            className="p-1 rounded-md lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-color text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-4">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <div className="flex items-center">
            <button 
              className="p-1 mr-4 rounded-md lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-xl font-semibold">REVA Admin Dashboard</h1>
          </div>
          
          {/* User dropdown */}
          <div className="relative">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <span className="font-medium">{currentUser?.name || 'Admin User'}</span>
                <span className="text-sm text-gray-500">{currentUser?.email || 'admin@example.com'}</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-color text-white">
                <FiUser size={20} />
              </div>
              <button 
                className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
                onClick={handleLogout}
                title="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
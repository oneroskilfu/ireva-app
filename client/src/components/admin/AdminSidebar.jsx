import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  DocumentTextIcon,
  HistoryIcon,
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const [location] = useLocation();
  
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin',
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      title: 'User Management',
      path: '/admin/users',
      icon: <UserGroupIcon className="h-5 w-5" />,
    },
    {
      title: 'Properties',
      path: '/admin/properties',
      icon: <BuildingOfficeIcon className="h-5 w-5" />,
    },
    {
      title: 'Investments',
      path: '/admin/investments',
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
    },
    {
      title: 'ROI Payments',
      path: '/admin/roi',
      icon: <DocumentChartBarIcon className="h-5 w-5" />,
    },
    {
      title: 'KYC Approval',
      path: '/admin/kyc',
      icon: <ShieldCheckIcon className="h-5 w-5" />,
    },
    {
      title: 'Notifications',
      path: '/admin/notifications',
      icon: <BellIcon className="h-5 w-5" />,
    },
    {
      title: 'Documents',
      path: '/admin/documents',
      icon: <DocumentTextIcon className="h-5 w-5" />,
    },
    {
      title: 'Audit Trail',
      path: '/admin/audit',
      icon: <HistoryIcon className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: <CogIcon className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto fixed left-0 top-0 z-10">
      <div className="px-6 py-6">
        <h2 className="text-xl font-bold text-gray-800">iREVA Admin</h2>
        <p className="text-sm text-gray-600">Property Investment Platform</p>
      </div>
      
      <nav className="mt-2">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium ${
                    location === item.path
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={location === item.path ? 'text-indigo-700' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  {item.title}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
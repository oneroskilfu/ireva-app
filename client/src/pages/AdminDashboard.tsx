import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-3xl mx-auto border-l-4 border-red-500">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to the Admin Panel</h1>
        <p className="text-lg text-gray-700 text-center">
          You have successfully logged in with administrative privileges.
        </p>
        <div className="mt-8 p-4 bg-red-50 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Administrator Account</h2>
          <p>Role: Admin</p>
          <p>Access Level: Full System Access</p>
        </div>
      </div>
    </div>
  );
}
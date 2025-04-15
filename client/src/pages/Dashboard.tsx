import React from 'react';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to the User Dashboard</h1>
        <p className="text-lg text-gray-700 text-center">
          You have successfully logged in as a regular user.
        </p>
        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Your Account</h2>
          <p>Role: Investor</p>
          <p>Access Level: Standard</p>
        </div>
      </div>
    </div>
  );
}
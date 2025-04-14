import React from 'react';
import { Helmet } from 'react-helmet';
import JwtAuthExample from '@/components/auth/JwtAuthExample';

const JwtAuthTest = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>JWT Authentication Test | REVA</title>
      </Helmet>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">JWT Authentication Test</h1>
          <p className="mt-2 text-gray-600">
            This page demonstrates the JWT-based authentication flow for the REVA application.
          </p>
        </div>
        
        <JwtAuthExample />
        
        <div className="mt-12 bg-slate-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How JWT Authentication Works</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">1. Login Process</h3>
              <p className="text-sm mt-1 text-gray-600">
                When you login, the server validates your credentials and returns a JWT token
                that contains encoded information about your user account.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">2. Token Storage</h3>
              <p className="text-sm mt-1 text-gray-600">
                The JWT token is stored in your browser's localStorage and will be included in 
                subsequent requests to protected API endpoints.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">3. Making Authenticated Requests</h3>
              <p className="text-sm mt-1 text-gray-600">
                Every request to a protected API endpoint will include the JWT token in the 
                Authorization header (Bearer token format).
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">4. Server Verification</h3>
              <p className="text-sm mt-1 text-gray-600">
                The server verifies the token's signature and extracts the user information to 
                determine if the user has permission to access the requested resource.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">5. Token Expiration</h3>
              <p className="text-sm mt-1 text-gray-600">
                JWT tokens have an expiration time (typically 24 hours). Once expired, you'll need
                to login again to receive a new token.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JwtAuthTest;
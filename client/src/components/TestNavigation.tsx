import React from 'react';
import { Link, useLocation } from 'wouter';

const TestNavigation: React.FC = () => {
  const [location] = useLocation();
  
  // Create direct links to HTML test pages
  const testLoginUrl = '/basic-login.html';
  const testHtmlUrl = '/test-login.html';
  
  return (
    <div className="bg-yellow-100 border-yellow-400 border-t border-b p-3">
      <div className="container mx-auto">
        <h2 className="font-bold text-yellow-800 mb-2">Testing Tools</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/login">
            <span className={`px-3 py-1 rounded text-sm cursor-pointer ${location === '/login' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
              Login Page
            </span>
          </Link>
          
          <Link href="/test-auth">
            <span className={`px-3 py-1 rounded text-sm cursor-pointer ${location === '/test-auth' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
              Test Auth
            </span>
          </Link>
          
          <a 
            href={testLoginUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1 rounded text-sm bg-green-100 text-green-700 hover:bg-green-200"
          >
            Basic Login HTML
          </a>
          
          <a 
            href={testHtmlUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1 rounded text-sm bg-green-100 text-green-700 hover:bg-green-200"
          >
            Test Login HTML
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestNavigation;
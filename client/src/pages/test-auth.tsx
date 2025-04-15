import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Button } from '@/components/ui/button';

export default function TestAuth() {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<any>({});
  
  // Fetch current localStorage on load
  useEffect(() => {
    updateLocalStorageView();
  }, []);
  
  // Update the localStorage view
  const updateLocalStorageView = () => {
    const items: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          items[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch (e) {
          items[key] = localStorage.getItem(key);
        }
      }
    }
    setLocalStorageData(items);
  };
  
  // Test login
  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log('Making test login request');
      const response = await API.post('/login', {
        username: 'admin',
        password: 'password'
      });
      
      console.log('Test login response:', response);
      setResponse(response.data);
      
      // Set role-based token in localStorage
      const userData = response.data;
      if (userData) {
        const userWithRole = {
          ...userData,
          role: userData.isAdmin ? 'admin' : 'investor'
        };
        
        localStorage.setItem('user', JSON.stringify(userWithRole));
        localStorage.setItem('token', 'session-auth-token');
        updateLocalStorageView();
      }
    } catch (error: any) {
      console.error('Test login error:', error);
      setError(
        error.response 
          ? `${error.response.status}: ${JSON.stringify(error.response.data)}` 
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Clear localStorage
  const clearStorage = () => {
    localStorage.clear();
    updateLocalStorageView();
    setResponse(null);
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Test Actions</h2>
          <div className="space-y-4">
            <Button 
              onClick={testLogin} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Login (admin/password)'}
            </Button>
            
            <Button 
              onClick={clearStorage}
              variant="outline" 
              className="w-full"
            >
              Clear LocalStorage
            </Button>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold">Current localStorage:</h3>
            <pre className="bg-muted p-2 rounded text-xs mt-2 max-h-40 overflow-auto">
              {JSON.stringify(localStorageData, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">API Response</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {response && (
            <pre className="bg-muted p-2 rounded text-xs max-h-96 overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          )}
          
          {!response && !error && (
            <p className="text-muted-foreground">No response yet. Click "Test Login" to begin.</p>
          )}
        </div>
      </div>
    </div>
  );
}
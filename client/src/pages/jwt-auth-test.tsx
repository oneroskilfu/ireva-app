import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { getToken, setToken, logout, decodeToken } from "../utils/auth";
import axios from "axios";

export default function JwtAuthTest() {
  const [, setLocation] = useLocation();
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [token, setTokenState] = useState(getToken());
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Update decoded token info when token changes
    if (token) {
      setTokenInfo(decodeToken(token));
      fetchUserInfo();
    } else {
      setTokenInfo(null);
      setUser(null);
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: value
    });
  };

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching user info:', err);
      setLoading(false);
      if (err.response?.status === 401) {
        // If unauthorized, clear token
        handleLogout();
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/login', loginForm);
      
      // Save token to localStorage and update state
      setToken(res.data.token);
      setTokenState(res.data.token);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
      console.error('Login error:', err);
    }
  };

  const handleLogout = () => {
    logout();
    setTokenState(null);
  };

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>JWT Authentication Test</title>
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">JWT Authentication Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          
          {!token ? (
            <>
              <h3 className="text-lg font-medium mb-2">Login</h3>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={loginForm.username}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-4">
                <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                  You are logged in!
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
              <div className="mt-6">
                <button
                  onClick={fetchUserInfo}
                  disabled={loading}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh User Info'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Token Information</h2>
          
          {token ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">JWT Token</h3>
                <div className="bg-gray-100 p-3 rounded overflow-x-auto">
                  <code className="text-sm break-all">{token}</code>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Decoded Token</h3>
                <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify(tokenInfo, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">User Information</h3>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : user ? (
                  <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                ) : (
                  <div className="text-gray-500">User information not loaded</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Log in to see token information</div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setLocation('/')}
          className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
        >
          Back to Home
        </button>
        <button
          onClick={() => setLocation('/dashboard')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify if the token is expired
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = tokenData.exp * 1000; // Convert to milliseconds
        
        if (Date.now() >= expiryTime) {
          // Token is expired
          console.log('Token expired');
          localStorage.removeItem('token');
        } else {
          setUser(tokenData);
        }
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
      }
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={user ? (
              user.role === 'admin' ? 
                <Navigate to="/admin" /> : 
                <Navigate to="/dashboard" />
              ) : (
                <Login setUser={setUser} />
              )
            } 
          />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <InvestorDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
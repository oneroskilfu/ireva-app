import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import Messages from './pages/Messages';
import InvestmentHistory from './pages/InvestmentHistory';
import PrivateRoute from './components/PrivateRoute';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          
          {/* Admin routes */}
          <Route
            path="/admin"
            element={<PrivateRoute component={AdminDashboard} role="admin" />}
          />
          
          {/* Investor routes */}
          <Route
            path="/investor"
            element={<PrivateRoute component={InvestorDashboard} role="investor" />}
          />
          
          {/* Protected routes for all authenticated users */}
          <Route path="/messages" element={<PrivateRoute component={Messages} />} />
          <Route path="/history" element={<PrivateRoute component={InvestmentHistory} />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;
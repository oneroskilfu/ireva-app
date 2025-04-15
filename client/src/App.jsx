import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import Messages from './pages/Messages';
import InvestmentHistory from './pages/InvestmentHistory';
import AdminProfile from './pages/AdminProfile';
import AdminKYC from './pages/AdminKYC';
import AdminSettings from './pages/AdminSettings';
import PropertyListing from './pages/PropertyListing';
import PropertyDetails from './pages/PropertyDetails';
import PropertyInvestment from './pages/PropertyInvestment';
import InvestmentSuccess from './pages/InvestmentSuccess';
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
          <Route path="/properties" element={<PropertyListing />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          
          {/* Admin routes */}
          <Route
            path="/admin"
            element={<PrivateRoute component={AdminDashboard} role="admin" />}
          />
          <Route path="/admin/profile" element={<PrivateRoute component={AdminProfile} role="admin" />} />
          <Route path="/admin/kyc" element={<PrivateRoute component={AdminKYC} role="admin" />} />
          <Route path="/admin/settings" element={<PrivateRoute component={AdminSettings} role="admin" />} />
          
          {/* Investor routes */}
          <Route
            path="/investor"
            element={<PrivateRoute component={InvestorDashboard} role="investor" />}
          />
          
          {/* Protected routes for all authenticated users */}
          <Route path="/messages" element={<PrivateRoute component={Messages} />} />
          <Route path="/history" element={<PrivateRoute component={InvestmentHistory} />} />
          <Route path="/properties/:id/invest" element={<PrivateRoute component={PropertyInvestment} />} />
          <Route path="/investments/:id/success" element={<PrivateRoute component={InvestmentSuccess} />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;
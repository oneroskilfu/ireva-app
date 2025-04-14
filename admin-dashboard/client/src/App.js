import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Properties from './pages/Properties';
import Investments from './pages/Investments';
import KycManagement from './pages/KycManagement';
import Developers from './pages/Developers';
import Projects from './pages/Projects';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import NotFound from './pages/NotFound';

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="properties" element={<Properties />} />
        <Route path="investments" element={<Investments />} />
        <Route path="kyc" element={<KycManagement />} />
        <Route path="developers" element={<Developers />} />
        <Route path="projects" element={<Projects />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
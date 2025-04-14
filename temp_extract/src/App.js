import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Investments from './pages/Investments';
import RoiTracker from './pages/RoiTracker';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Sidebar />
        <div style={{ marginLeft: 240, padding: 20 }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/roi" element={<RoiTracker />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
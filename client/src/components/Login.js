import React, { useState } from 'react';
import API from '../utils/api';

const Login = ({ setUser }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      const user = JSON.parse(atob(res.data.token.split('.')[1]));
      setUser(user); // Save user info from token
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Welcome Back</h2>
      
      <input 
        type="text" 
        placeholder="Username" 
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })} 
        required 
      />
      
      <input 
        type="password" 
        placeholder="Password" 
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} 
        required 
      />
      
      <button type="submit">Login</button>
      
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default Login;
import React, { useState } from 'react';
import API from '../utils/api';

const Register = ({ setUser }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'investor' });
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      const res = await API.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);
      const user = JSON.parse(atob(res.data.token.split('.')[1]));
      setUser(user); // Save role, email, etc.
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Create Account</h2>
      
      <input 
        type="text" 
        placeholder="Name" 
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} 
        required 
      />
      
      <input 
        type="email" 
        placeholder="Email" 
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} 
        required 
      />
      
      <input 
        type="password" 
        placeholder="Password" 
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} 
        required 
      />
      
      <select 
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="investor">Investor</option>
        <option value="project_owner">Project Owner</option>
      </select>
      
      <button type="submit">Register</button>
      
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default Register;
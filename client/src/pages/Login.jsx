import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      const user = JSON.parse(atob(res.data.token.split('.')[1]));
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/investor');
      }
    } catch (err) {
      setError('Invalid login');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin}>
        <h2>REVA Login</h2>
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
        <button type="submit">Login</button>
        {error && <p className="error-message">{error}</p>}
        <p className="toggle-auth">
          Don't have an account?{' '}
          <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
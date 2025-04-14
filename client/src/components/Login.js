// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      const { token } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
    } catch (err) {
      setError('Invalid login credentials');
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username"
          value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;
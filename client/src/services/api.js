import axios from 'axios';

// Use a relative URL to avoid CORS issues when running in the same domain
const API = axios.create({
  baseURL: '/api',  // This will make requests relative to the current domain
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
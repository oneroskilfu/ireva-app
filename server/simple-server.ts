import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Mock authentication endpoint for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication - in production this would validate against database
  if (email && password) {
    const user = {
      id: '1',
      email: email,
      firstName: 'Demo',
      lastName: 'User',
      role: email.includes('admin') ? 'admin' : 'investor'
    };
    
    const token = 'mock-jwt-token-' + Date.now();
    
    res.json({ 
      token,
      user,
      message: 'Login successful'
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Mock profile endpoint
app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader?.startsWith('Bearer ')) {
    const user = {
      id: '1',
      email: 'demo@ireva.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'investor'
    };
    
    res.json(user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Mock properties endpoint
app.get('/api/properties', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Lagos Premium Apartment Complex',
      location: 'Victoria Island, Lagos',
      price: 250000000,
      roi: 12.5,
      status: 'active'
    },
    {
      id: '2', 
      title: 'Abuja Commercial Plaza',
      location: 'Central Business District, Abuja',
      price: 180000000,
      roi: 15.2,
      status: 'active'
    }
  ]);
});

// Serve static files from client build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, '../client/dist');

app.use(express.static(clientBuildPath));

// Handle client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ message: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 iREVA Platform running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Frontend: http://0.0.0.0:${PORT}`);
  console.log(`🔑 API: http://0.0.0.0:${PORT}/api`);
  console.log(`✅ Authentication system ready!`);
});
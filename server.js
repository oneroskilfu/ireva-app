const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { roles } = require('./middleware/roleMiddleware');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reva_platform')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Routes
const authRoutes = require('./routes/authController');
app.use('/api/auth', authRoutes);

// Create default admin if none exists
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createDefaultAdmin = async () => {
  try {
    const adminCount = await User.countDocuments({ role: roles.ADMIN });
    
    if (adminCount === 0) {
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin@password123';
      
      await User.create({
        username: 'admin',
        email: 'admin@reva.com',
        password: adminPassword,
        role: roles.ADMIN,
        isEmailVerified: true
      });
      
      console.log('Admin user created. Username: admin, Password: ' + 
        (process.env.DEFAULT_ADMIN_PASSWORD ? '[from env]' : 'admin@password123'));
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Catch-all for errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await createDefaultAdmin();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server
});

module.exports = app;
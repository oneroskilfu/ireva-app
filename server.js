const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { roles } = require('./middleware/roleMiddleware');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authController');
app.use('/api/auth', authRoutes);

// Create default admin if none exists
const User = require('./models/User');

const createDefaultAdmin = async () => {
  try {
    const adminCount = await User.countDocuments({ role: roles.ADMIN });
    
    if (adminCount === 0) {
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin@password123';
      
      await User.create({
        name: 'Admin User',
        email: 'admin@reva.com',
        password: adminPassword,
        role: roles.ADMIN
      });
      
      console.log('Admin user created. Email: admin@reva.com, Password: ' + 
        (process.env.DEFAULT_ADMIN_PASSWORD ? '[from env]' : 'admin@password123'));
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// DB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected");
    createDefaultAdmin();
  })
  .catch(err => console.error("MongoDB error:", err));

// Simple error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;
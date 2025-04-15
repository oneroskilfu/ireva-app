import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB Error", err));

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'iREVA API is running' });
});

// User routes
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API test endpoint is working',
    time: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
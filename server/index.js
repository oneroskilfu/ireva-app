require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB Error", err));

// Route imports
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/roi', require('./routes/roi'));
app.use('/api/messages', require('./routes/messages'));

app.listen(5000, () => console.log('Server running on port 5000'));
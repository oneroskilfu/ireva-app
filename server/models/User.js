const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String // 'admin', 'developer', etc
});

module.exports = mongoose.model('User', UserSchema);
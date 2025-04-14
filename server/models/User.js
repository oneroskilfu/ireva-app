import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String // 'admin', 'developer', etc
});

export const User = mongoose.model('User', UserSchema);
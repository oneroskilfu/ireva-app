import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" } // 'admin', 'developer', 'investor', etc
});

export const User = mongoose.model('User', UserSchema);
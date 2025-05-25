// /models/User.js

const mongoose = require('mongoose');

// Define User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken:{type: String},
resetPasswordExpires: { type: Date},

  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
}, { timestamps: true });

// Export User model
module.exports = mongoose.model('User', userSchema);

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
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  profile: {
    displayName: {
      type: String,
      trim: true,
      default: function() {
        return this.username;
      }
    },
    avatar: {
      type: String,
      default: 'https://img.icons8.com/color/96/000000/user.png'
    },
    bio: {
      type: String,
      trim: true,
      maxLength: 500,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      trim: true,
      default: ''
    }
  }
}, { timestamps: true });

// Export User model
module.exports = mongoose.model('User', userSchema);

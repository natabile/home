const express = require('express');
const router = express.Router();
const { registerUser, loginUser, countUsers, getAllUsers, forgotPassword, resetPassword, getUserProfile, updateProfile,uploadProfileImage } = require('../controler/authControler');
const { verifyToken } = require('../middleware/authMiddleware');

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Protected profile route
router.get('/profile', verifyToken, getUserProfile);

// Update profile route
router.put('/profile', verifyToken, updateProfile);

// Upload profile image route
router.post('/profile/image', verifyToken, uploadProfileImage);

// Admin-only route to get the number of registered users
router.get('/admin/users/count', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admin only' });
  }
  countUsers(req, res);  // Calls the function to count the users
});

// Admin-only route to get the list of all users (usernames)
router.get('/admin/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admin only' });
  }
  getAllUsers(req, res);  // Calls the function to fetch all users' usernames
});

// Forgot password route
router.post('/forgot-password', forgotPassword);

// Reset password route
router.post('/reset-password', resetPassword);

module.exports = router;

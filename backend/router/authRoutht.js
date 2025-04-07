const express = require('express');
const router = express.Router();
const { registerUser, loginUser, countUsers, getAllUsers } = require('../controler/authControler');
const { verifyToken } = require('../middleware/authMiddleware');

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Protected profile route
router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'User profile fetched successfully',
    user: req.user  // This will contain the decoded user information from the JWT
  });
});

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

module.exports = router;

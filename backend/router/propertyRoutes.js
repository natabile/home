const express = require('express');
const { postProperty, getAllProperties, uploadImages, getUserProperties } = require('../controler/propertyController');
const { verifyToken } = require('../middleware/authMiddleware');
const  { updateUserProperty, deleteUserProperty }=require ("../controler/propertyController")

const router = express.Router();

// Route to post property with image upload
router.post('/post', verifyToken, uploadImages, postProperty);

// Route to get all properties
router.get('/', getAllProperties);

// Route to get user's properties
router.get('/my-properties', verifyToken, getUserProperties);

// Update property (texts only)
router.put('/my-properties/:id', verifyToken, updateUserProperty);

// Delete property (including image)
router.delete('/my-properties/:id', verifyToken, deleteUserProperty);


module.exports = router;

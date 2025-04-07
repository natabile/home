const express = require('express');
const { postProperty, getAllProperties, uploadImages } = require('../controler/propertyController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to post property with image upload
router.post('/post', verifyToken, uploadImages, postProperty);

// Route to get all properties
router.get('/properties', getAllProperties);

module.exports = router;

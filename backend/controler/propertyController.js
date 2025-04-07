const Property = require('../model/Property');
const Subscription = require('../model/Subscription');
const User = require('../model/user');
const multer = require('multer');
const path = require('path');

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // File name with extension
  }
});

// Initialize multer with storage configuration
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size (5MB per file)
}).array('images', 5);  // Allow only up to 5 images

// Middleware to handle file uploads
exports.uploadImages = upload;

// Post Property (With Max 5 Image Validation)
exports.postProperty = async (req, res) => {
  const { title, description, price, subscriptionType } = req.body;
  const images = req.files;  // Files from multer middleware

  try {
    // Ensure the user is uploading at most 5 images
    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required.' });
    }
    if (images.length > 5) {
      return res.status(400).json({ message: 'You can upload a maximum of 5 images.' });
    }

    // Prepare image paths for database storage
    const imagePaths = images.map((file) => file.path);

    const newProperty = new Property({
      title,
      description,
      price,
      images: imagePaths,  // Store file paths in the database
      postedBy: req.user.id,
      subscriptionType,
    });

    await newProperty.save();
    res.status(201).json({ message: 'Property posted successfully', property: newProperty });
  } catch (error) {
    res.status(500).json({ message: 'Error posting property', error });
  }
};

// Get All Properties (Only Active Status)
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: 'active' }).populate('postedBy', 'username');
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties', error });
  }
};

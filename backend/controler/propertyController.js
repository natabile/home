const Property = require('../model/Property');
const multer = require('multer');
const path = require('path');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Multer upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }  // 5MB max per file
}).array('images', 5);  // Max 5 images

exports.uploadImages = upload;

exports.postProperty = async (req, res) => {
  const { title, description, price, subscriptionType, latitude, longitude } = req.body;
  const images = req.files;

  // Validate images (remove if optional)
  if (!images || images.length === 0) {
    return res.status(400).json({ message: 'At least one image is required.' });
  }
  if (images.length > 5) {
    return res.status(400).json({ message: 'You can upload a maximum of 5 images.' });
  }

  try {
    const imagePaths = images.map(file => file.path);

    // Parse latitude and longitude if provided
    let lat = latitude ? parseFloat(latitude) : null;
    let lng = longitude ? parseFloat(longitude) : null;

    const newProperty = new Property({
      title,
      description,
      price,
      images: imagePaths,
      postedBy: req.user.id,
      subscriptionType,
      ...(lat !== null && lng !== null ? { latitude: lat, longitude: lng } : {})
    });

    await newProperty.save();
    res.status(201).json({ message: 'Property posted successfully', property: newProperty });
  } catch (error) {
    res.status(500).json({ message: 'Error posting property', error });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: 'active' }).populate('postedBy', 'username');
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties', error });
  }
};

exports.getUserProperties = async (req, res) => {
  try {
    const properties = await Property.find({ postedBy: req.user.id });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user properties' });
  }
};
exports.updateUserProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow certain fields to be updated
    const allowedFields = ['title', 'description', 'price', 'location']; // Add any text-only fields here
    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const property = await Property.findOneAndUpdate(
      { _id: id, postedBy: req.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found or not authorized' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error updating property' });
  }
};
exports.deleteUserProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findOneAndDelete({ _id: id, postedBy: req.user.id });

    if (!property) {
      return res.status(404).json({ message: 'Property not found or not authorized' });
    }

    // TODO: Delete image file from storage if needed
    // For example, if using local file storage:
    // fs.unlinkSync(`./uploads/${property.imageFilename}`);

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting property' });
  }
};

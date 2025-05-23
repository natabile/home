const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },

  images: [String],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subscriptionType: {
    type: String,
    enum: ['one-time', 'monthly', 'quarterly'],
    required: true
  },
  postDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false }

}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);

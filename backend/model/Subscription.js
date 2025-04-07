// models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subscriptionType: {
    type: String,
    enum: ['one-time', 'monthly', 'quarterly'],
    required: true
  },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);

// /models/Chat.js

const mongoose = require('mongoose');

// Define Chat schema
const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      replyTo: { type: mongoose.Schema.Types.ObjectId, default: null }
    }
  ],
}, { timestamps: true });

// Export Chat model
module.exports = mongoose.model('Chat', chatSchema);

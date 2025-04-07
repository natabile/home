const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Chat = require('../model/chat');
const User = require('../model/user');

module.exports = (io) => {
  // Route to start or retrieve a chat between two users
  router.post('/start', async (req, res) => {
    console.log('Start chat route hit');
    const { senderId, receiverId, propertyId } = req.body;

    try {
      // Validate senderId, receiverId, and propertyId
      if (
        !mongoose.Types.ObjectId.isValid(senderId) ||
        !mongoose.Types.ObjectId.isValid(receiverId) ||
        !mongoose.Types.ObjectId.isValid(propertyId)
      ) {
        return res.status(400).json({ error: 'Invalid sender, receiver, or property ID' });
      }

      // Check if a chat already exists between the users for the property
      let chat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] },
        property: propertyId,
      });

      // If no chat exists, create a new one
      if (!chat) {
        chat = new Chat({
          participants: [senderId, receiverId],
          property: propertyId,
          messages: [],
        });
        await chat.save();
      }
      console.log('Chat created or found with ID:', chat._id);
      // Return only the chat ID
      res.status(200).json({ _id: chat._id });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Server Error' });
    }
  });

  // Route to fetch messages for a specific chat
  // Route to fetch messages for a specific chat
  router.get('/messages/:chatId', async (req, res) => {
    const { chatId } = req.params;

    try {
      // Validate chatId
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ error: 'Invalid chat ID' });
      }

      // Find the chat and populate messages with sender's username
      const chat = await Chat.findById(chatId)
        .populate({
          path: 'messages.sender',
          select: 'username', // Ensure sender's username is included
        })
        .populate({
          path: 'participants',
          select: 'username',
        });

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      // Return messages with sender details
      res.status(200).json(chat.messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  });


  // Route to send a message in an existing chat
  // Route to send a message in an existing chat
  router.post('/send_message', async (req, res) => {
    const { chatId, senderId, content } = req.body;

    try {
      // Validate chatId and senderId
      if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(senderId)) {
        return res.status(400).json({ error: 'Invalid chat ID or sender ID' });
      }

      // Find the chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      // Check if the sender is a participant in the chat
      if (!chat.participants.includes(senderId)) {
        return res.status(403).json({ error: 'You are not a participant in this chat' });
      }

      // Fetch sender details (username)
      const sender = await User.findById(senderId).select('username');
      if (!sender) {
        return res.status(404).json({ error: 'Sender not found' });
      }

      // Create the message object with sender details
      const newMessage = {
        sender: senderId,
        content,
        timestamp: new Date(),
      };

      // Add message to chat's messages array
      chat.messages.push(newMessage);
      await chat.save();

      // Emit the message to all users in the chat room
      io.to(chatId).emit('receiveMessage', {
        ...newMessage,
        sender: { _id: sender._id, username: sender.username }, // Attach sender's username
      });

      res.status(200).json({
        ...newMessage,
        sender: { _id: sender._id, username: sender.username },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server Error' });
    }
  });


  return router;
};
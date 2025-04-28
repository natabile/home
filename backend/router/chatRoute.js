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

  // Route to fetch messages for a specific property
  router.get('/property-messages/:propertyId', async (req, res) => {
    const { propertyId } = req.params;

    try {
      // Validate propertyId
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({ error: 'Invalid property ID' });
      }

      // Find all chats for this property
      const chats = await Chat.find({ property: propertyId })
        .populate({
          path: 'messages.sender',
          select: 'username'
        })
        .populate({
          path: 'participants',
          select: 'username'
        });

      if (!chats || chats.length === 0) {
        return res.status(200).json([]);
      }

      // Flatten all messages from all chats
      const allMessages = chats.reduce((acc, chat) => {
        const chatMessages = chat.messages.map(msg => ({
          ...msg.toObject(),
          chatId: chat._id,
          sender: msg.sender
        }));
        return [...acc, ...chatMessages];
      }, []);

      // Sort messages by timestamp
      allMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.status(200).json(allMessages);
    } catch (error) {
      console.error('Error fetching property messages:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  });

  // Route to fetch chats for a property owner
  router.get('/owner-chats/:ownerId', async (req, res) => {
    const { ownerId } = req.params;

    try {
      // Validate ownerId
      if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        return res.status(400).json({ error: 'Invalid owner ID' });
      }

      // Find all chats where the owner is a participant
      const chats = await Chat.find({
        participants: ownerId,
        property: { $exists: true }
      })
      .populate({
        path: 'property',
        select: 'title'
      })
      .populate({
        path: 'participants',
        select: 'username'
      })
      .populate({
        path: 'messages.sender',
        select: 'username'
      });

      // Process chats to include buyer information
      const processedChats = chats.map(chat => {
        const buyer = chat.participants.find(p => p._id.toString() !== ownerId);
        return {
          ...chat.toObject(),
          buyer: buyer || { username: 'Unknown' }
        };
      });

      res.status(200).json(processedChats);
    } catch (error) {
      console.error('Error fetching owner chats:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  });

  // Route to fetch chats for a user
  router.get('/my-chats/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Find all chats where the user is a participant
      const chats = await Chat.find({
        participants: userId,
        property: { $exists: true }
      })
      .populate({
        path: 'property',
        select: 'title'
      })
      .populate({
        path: 'participants',
        select: 'username'
      })
      .populate({
        path: 'messages.sender',
        select: 'username'
      });

      // Process chats to include owner information
      const processedChats = chats.map(chat => {
        const owner = chat.participants.find(p => p._id.toString() !== userId);
        return {
          ...chat.toObject(),
          owner: owner || { username: 'Unknown' }
        };
      });

      res.status(200).json(processedChats);
    } catch (error) {
      console.error('Error fetching user chats:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  });

  return router;
};
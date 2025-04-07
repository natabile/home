const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./router/authRoutht');
const propertyRoutes = require('./router/propertyRoutes');
const chatRoutes = require('./router/chatRoute');

// Load environment variables
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(
  cors({
    origin: 'http://localhost:5173', // Allow requests from your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
    credentials: true, // Allow cookies and credentials
  })
);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Allow Socket.IO connections from your frontend
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(express.json());

// Serve images from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/chat', chatRoutes(io)); // Pass the io instance to chatRoutes

// Import the Chat model
const Chat = require('./model/chat');
const User = require('./model/user');

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a chat room and fetch chat history
  socket.on('joinChat', async (chatId) => {
    try {
      // Validate chatId
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return socket.emit('error', 'Invalid chat ID');
      }

      // Find the chat and populate messages
      const chat = await Chat.findById(chatId)
        .populate('messages.sender', 'name') // Populate sender details
        .populate('participants', 'name'); // Populate participant details

      if (!chat) {
        return socket.emit('error', 'Chat not found');
      }

      // Join the chat room
      socket.join(chatId);

      // Send chat history to the user
      socket.emit('chatHistory', chat.messages);

      console.log(`User joined chat: ${chatId}`);
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', 'Server error, please try again');
    }
  });

  // Handle sending a message
  socket.on('sendMessage', async (messageData) => {
    const { chatId, senderId, content } = messageData;

    try {
      // Validate chatId and senderId
      if (
        !mongoose.Types.ObjectId.isValid(chatId) ||
        !mongoose.Types.ObjectId.isValid(senderId)
      ) {
        return socket.emit('error', 'Invalid chat ID or sender ID');
      }

      // Find the chat
      const chat = await Chat.findById(chatId);

      if (!chat) {
        return socket.emit('error', 'Chat not found');
      }

      // Check if the sender is a participant in the chat
      if (!chat.participants.includes(senderId)) {
        return socket.emit('error', 'You are not a participant in this chat');
      }

      // Create new message object
      const newMessage = {
        sender: senderId,
        content,
        timestamp: new Date(),
      };

      // Save the message to the chat's messages array
      chat.messages.push(newMessage);
      await chat.save();

      // Populate sender details before emitting
      const populatedMessage = await Chat.populate(newMessage, {
        path: 'sender',
        select: 'name',
      });

      // Emit the message to all users in the chat room
      io.to(chatId).emit('receiveMessage', populatedMessage);

      console.log(`Message sent and saved in chat ${chatId}: ${content}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Server error, please try again');
    }
  });

  // Handle typing indicators
  socket.on('typing', (chatId) => {
    socket.to(chatId).emit('userTyping', socket.id);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Leave all chat rooms
    socket.rooms.forEach((room) => {
      socket.leave(room);
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
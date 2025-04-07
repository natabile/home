import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Box, Typography, TextField, Button, List, ListItem, CircularProgress, Paper } from '@mui/material';

const socket = io('http://localhost:5000', { withCredentials: true });

const Chat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);

  const senderId = localStorage.getItem('userId');
  const senderUsername = localStorage.getItem('username');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chat/messages/${chatId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    socket.emit('joinChat', chatId);

    socket.on('receiveMessage', (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    socket.on('userTyping', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('userTyping');
      socket.off('connect_error');
      socket.emit('leaveChat', chatId);
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      chatId,
      senderId,
      content: newMessage,
      sender: { _id: senderId, username: senderUsername },
      createdAt: new Date().toISOString()
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      { ...messageData, sender: { ...messageData.sender, username: 'You' } },
    ]);
    setNewMessage('');

    socket.emit('sendMessage', messageData, (error) => {
      if (error) {
        console.error('Error sending message:', error);
        setMessages((prevMessages) => prevMessages.slice(0, -1));
        setNewMessage(newMessage);
      }
    });
  };

  const handleTyping = () => {
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => {
        socket.emit('typing', chatId);
      }, 1000)
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 2, borderRadius: '8px' }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Endebet Chat
        </Typography>
        <Box sx={{ marginBottom: 2 }}>
          <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {messages.map((message, index) => (
              <ListItem key={index} sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: 2 }}>
                <Box sx={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '8px', maxWidth: '80%' }}>
                  <Typography variant="body1" color="textPrimary">
                    <strong>{message.sender?._id === senderId ? 'You' : message.sender?.username || 'Unknown'}</strong>: {message.content}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : 'Just now'}
                  </Typography>
                </Box>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
          {isTyping && (
            <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 1 }}>
              Someone is typing...
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <TextField
            label="Type a message"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            fullWidth
            variant="outlined"
            sx={{ marginBottom: 2 }}
          />
          <Button
            onClick={handleSendMessage}
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              padding: '12px',
              textTransform: 'none',
              fontSize: '16px',
              '&:hover': { backgroundColor: '#1976d2' },
            }}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat;
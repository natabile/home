import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Paper,
  Divider
} from '@mui/material';
import axios from 'axios';

const PropertyMessages = ({ property, messages, onMessageSent }) => {
  const [reply, setReply] = useState('');
  const userId = localStorage.getItem('userId');

  const handleSendReply = async (chatId) => {
    if (!reply.trim()) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.post('http://localhost:5000/api/chat/send_message', {
        chatId,
        senderId: userId,
        content: reply.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReply('');
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    }
  };

  // Group messages by chat
  const messagesByChat = messages.reduce((acc, msg) => {
    if (!acc[msg.chatId]) {
      acc[msg.chatId] = [];
    }
    acc[msg.chatId].push(msg);
    return acc;
  }, {});

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Messages for {property.title}
      </Typography>
      {Object.entries(messagesByChat).map(([chatId, chatMessages]) => (
        <Paper key={chatId} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Chat with {chatMessages[0].sender?.username || 'Unknown User'}
          </Typography>
          <List>
            {chatMessages.map((msg, index) => (
              <React.Fragment key={msg._id || index}>
                <ListItem>
                  <ListItemText
                    primary={msg.content}
                    secondary={`${msg.sender?.username || 'Unknown'} - ${new Date(msg.timestamp).toLocaleString()}`}
                  />
                </ListItem>
                {index < chatMessages.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Write your reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSendReply(chatId)}
            >
              Reply
            </Button>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default PropertyMessages;

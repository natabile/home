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
  Divider,
  Stack,
  Avatar,
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
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    }
  };

  const messagesByChat = messages.reduce((acc, msg) => {
    if (!acc[msg.chatId]) acc[msg.chatId] = [];
    acc[msg.chatId].push(msg);
    return acc;
  }, {});

  return (
    <Box sx={{ mt: 4, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h5" gutterBottom>
        Messages for <strong>{property.title}</strong>
      </Typography>

      {Object.entries(messagesByChat).map(([chatId, chatMessages]) => {
        const otherUser = chatMessages.find(msg => msg.sender?._id !== userId)?.sender?.username || 'User';

        return (
          <Paper key={chatId} elevation={3} sx={{ p: 2, mb: 4 }}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Chat with <strong>{otherUser}</strong>
            </Typography>

            <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
              <List disablePadding>
                {chatMessages.map((msg, index) => {
                  const isMine = msg.sender?._id === userId;
                  return (
                    <React.Fragment key={msg._id || index}>
                      <ListItem
                        sx={{
                          display: 'flex',
                          justifyContent: isMine ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '75%',
                            bgcolor: isMine ? 'primary.main' : 'grey.200',
                            color: isMine ? 'white' : 'text.primary',
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            boxShadow: 1
                          }}
                        >
                          <Typography variant="body2">{msg.content}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                            {msg.sender?.username || 'Unknown'} — {new Date(msg.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < chatMessages.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            </Box>

            <Stack spacing={1}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Write your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={() => handleSendReply(chatId)}
              >
                Send Reply
              </Button>
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
};

export default PropertyMessages;

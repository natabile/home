import React, { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyMessages = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyMessages, setReplyMessages] = useState({});
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchMyChats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/chat/my-chats/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(response.data);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMyChats();
  }, [userId, navigate]);

  const handleReplyChange = (chatId, value) => {
    setReplyMessages((prev) => ({ ...prev, [chatId]: value }));
  };

  const handleSendReply = async (chatId) => {
    const content = replyMessages[chatId]?.trim();
    if (!content) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/chat/send_message',
        {
          chatId,
          senderId: userId,
          content,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Clear input and refresh chat messages
      setReplyMessages((prev) => ({ ...prev, [chatId]: '' }));
      const updated = await axios.get(`http://localhost:5000/api/chat/my-chats/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(updated.data);
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        My Messages
      </Typography>
      {chats.length === 0 ? (
        <Typography>No messages yet</Typography>
      ) : (
        <List>
          {chats.map((chat) => (
            <Paper key={chat._id} sx={{ mb: 3, p: 2 }}>
              <Typography variant="h6">Property: {chat.property?.title}</Typography>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Owner: {chat.owner?.username}
              </Typography>
              <List>
                {chat.messages.map((message, index) => (
                  <React.Fragment key={message._id || index}>
                    <ListItem>
                      <ListItemText
                        primary={message.content}
                        secondary={`${message.sender?.username} - ${new Date(
                          message.timestamp
                        ).toLocaleString()}`}
                        sx={{
                          backgroundColor: message.sender?._id === userId ? '#e3f2fd' : '#f5f5f5',
                          padding: '8px',
                          borderRadius: '4px',
                        }}
                      />
                    </ListItem>
                    {index < chat.messages.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              {/* Reply input */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type your reply..."
                  value={replyMessages[chat._id] || ''}
                  onChange={(e) => handleReplyChange(chat._id, e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={() => handleSendReply(chat._id)}
                  disabled={!replyMessages[chat._id]?.trim()}
                >
                  Send
                </Button>
              </Box>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default MyMessages;

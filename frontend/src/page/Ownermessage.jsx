import React, { useEffect, useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box, 
  CircularProgress,
  Paper,
  TextField,
  Button,
  Divider
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OwnerMessages = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reply, setReply] = useState('');
  const navigate = useNavigate();
  const ownerId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/chat/owner-chats/${ownerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChats(response.data);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [ownerId, navigate]);

  const handleSendReply = async (chatId) => {
    if (!reply.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/chat/send_message', {
        chatId,
        senderId: ownerId,
        content: reply.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReply('');
      // Refresh chats to show new message
      const response = await axios.get(`http://localhost:5000/api/chat/owner-chats/${ownerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>Received Messages</Typography>
      {chats.length === 0 ? (
        <Typography>No messages yet</Typography>
      ) : (
        <List>
          {chats.map((chat) => (
            <Paper key={chat._id} sx={{ mb: 2, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Property: {chat.property?.title}
              </Typography>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                From: {chat.buyer?.username}
              </Typography>
              <List>
                {chat.messages.map((message, index) => (
                  <React.Fragment key={message._id || index}>
                    <ListItem>
                      <ListItemText
                        primary={message.content}
                        secondary={`${message.sender?.username} - ${new Date(message.timestamp).toLocaleString()}`}
                      />
                    </ListItem>
                    {index < chat.messages.length - 1 && <Divider />}
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
                  onClick={() => handleSendReply(chat._id)}
                >
                  Reply
                </Button>
              </Box>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default OwnerMessages;

import React, { useEffect, useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box, 
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyMessages = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    fetchMyChats();
  }, [userId, navigate]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>My Messages</Typography>
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
                Owner: {chat.owner?.username}
              </Typography>
              <List>
                {chat.messages.map((message, index) => (
                  <React.Fragment key={message._id || index}>
                    <ListItem>
                      <ListItemText
                        primary={message.content}
                        secondary={`${message.sender?.username} - ${new Date(message.timestamp).toLocaleString()}`}
                        sx={{
                          backgroundColor: message.sender?._id === userId ? '#e3f2fd' : '#f5f5f5',
                          padding: '8px',
                          borderRadius: '4px'
                        }}
                      />
                    </ListItem>
                    {index < chat.messages.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default MyMessages; 
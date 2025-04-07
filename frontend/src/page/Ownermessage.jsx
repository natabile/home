import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OwnerMessages = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const ownerId = localStorage.getItem('userId'); // Get owner ID from local storage

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chat/owner-messages/${ownerId}`);
        setChats(response.data);
      } catch (err) {
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [ownerId]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>Received Messages</Typography>
      <List>
        {chats.map((chat) => (
          <ListItem
            key={chat._id}
            button
            onClick={() => navigate(`/chat/${chat.chatId}`)}
          >
            <ListItemText
              primary={`From: ${chat.buyerName}`}
              secondary={`Property: ${chat.propertyTitle} | ${chat.lastMessage}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default OwnerMessages;

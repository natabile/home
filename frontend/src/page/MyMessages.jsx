import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  CircularProgress,
  Paper,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyMessages = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyMessages, setReplyMessages] = useState({});
  const [expandedChats, setExpandedChats] = useState({});
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchChats = async () => {
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
        setError('Failed to load messages.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [navigate, userId]);

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

      // Clear input
      setReplyMessages((prev) => ({ ...prev, [chatId]: '' }));

      // Refresh chats
      const response = await axios.get(`http://localhost:5000/api/chat/my-chats/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChats(response.data);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send reply.');
    }
  };

  const toggleExpand = (chatId) => {
    setExpandedChats((prev) => ({
      ...prev,
      [chatId]: !prev[chatId],
    }));
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f7fa, #e8f5e9)',
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        My Messages
      </Typography>

      {chats.length === 0 ? (
        <Typography>No messages yet.</Typography>
      ) : (
        <List>
          {chats.map((chat) => {
            const isOpen = expandedChats[chat._id];

            return (
              <Paper
                key={chat._id}
                sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: '#ffffff' }}
                elevation={3}
              >
                <Box
                  onClick={() => toggleExpand(chat._id)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ color: '#1976d2' }}>
                      🏠 {chat.property?.title || 'Unknown Property'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                      👤 Owner: {chat.owner?.username || 'Unknown'}
                    </Typography>
                  </Box>
                  <IconButton>
                    {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <Collapse in={isOpen}>
                  <List sx={{ mt: 2 }}>
                    {chat.messages.map((msg, index) => (
                      <React.Fragment key={msg._id}>
                        <ListItem
                          sx={{
                            backgroundColor:
                              msg.sender?._id === userId ? '#e3f2fd' : '#fce4ec',
                            borderRadius: 2,
                            mb: 1,
                          }}
                        >
                          <ListItemText
                            primary={msg.content}
                            secondary={`${msg.sender?.username} — ${new Date(
                              msg.timestamp
                            ).toLocaleString()}`}
                          />
                        </ListItem>
                        {index < chat.messages.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>

                  {/* Reply Section */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      placeholder="Type your message..."
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
                </Collapse>
              </Paper>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default MyMessages;

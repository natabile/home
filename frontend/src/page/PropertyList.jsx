import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../componet/PropertyCard';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/properties', {
          params: {
            populate: 'postedBy'
          }
        });
        setProperties(response.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to fetch properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleChatClick = (property) => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    setSelectedProperty(property);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!userId || !token) {
        setError('Please login to send messages');
        navigate('/login');
        return;
      }

      if (!selectedProperty?.postedBy || !selectedProperty?._id) {
        setError('Invalid property information');
        return;
      }

      // First, start a chat or get existing chat
      const chatResponse = await axios.post('http://localhost:5000/api/chat/start', {
        senderId: userId,
        receiverId: selectedProperty.postedBy._id,
        propertyId: selectedProperty._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Chat created:', chatResponse.data);

      // Then send the message
      await axios.post('http://localhost:5000/api/chat/send_message', {
        chatId: chatResponse.data._id,
        senderId: userId,
        content: message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('');
      setSelectedProperty(null);
      // Show success message
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send message. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property._id}>
              <PropertyCard 
                property={property} 
                showChat={true}
                onChatClick={handleChatClick}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      <Dialog open={!!selectedProperty} onClose={() => setSelectedProperty(null)}>
        <DialogTitle>Send Message about {selectedProperty?.title}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedProperty(null)}>Cancel</Button>
          <Button onClick={handleSendMessage} variant="contained" color="primary">
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PropertyList;
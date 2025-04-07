import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, CardMedia, Grid, Box, Button, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import Navbar from '../componet/nav';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      if (!localStorage.getItem('token')) {
        navigate('/login');
      }
      try {
        const response = await axios.get('http://localhost:5000/api/properties/properties');
        setProperties(response.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to fetch properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [navigate]);

  const handleImageClick = (property) => {
    setSelectedProperty(property);
  };

  const handleCloseModal = () => {
    setSelectedProperty(null);
  };

  const handleChatClick = async (propertyId, ownerId) => {
    try {
      const senderId = localStorage.getItem('userId');
      if (!senderId) {
        setError('You must be logged in to start a chat.');
        return;
      }
      const response = await axios.post('http://localhost:5000/api/chat/start', {
        senderId,
        receiverId: ownerId,
        propertyId,
      });
      const chatId = response.data._id;
      if (!chatId) {
        setError('Failed to start chat. Please try again.');
        return;
      }
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      setError('Failed to start chat. Please try again.');
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Grid container spacing={2} sx={{ padding: 2 }}>
        {properties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Show only the first image */}
              {property.images?.length > 0 && (
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://localhost:5000/${property.images[0]}`}
                  alt={property.title}
                  onClick={() => handleImageClick(property)}
                  sx={{ cursor: 'pointer' }}
                />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom>{property.title}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>{property.description}</Typography>
                <Typography variant="h6" color="primary" gutterBottom>{property.price}ETB</Typography>
                <Typography variant="body2" color="textSecondary">Posted by: {property.postedBy?.username || 'Unknown'}</Typography>
              </CardContent>
              <Box sx={{ padding: 2 }}>
                <Button variant="contained" color="primary" onClick={() => handleChatClick(property._id, property.postedBy._id)} fullWidth>
                  Start Chat
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedProperty && (
        <Dialog open={true} onClose={handleCloseModal} fullWidth maxWidth="md">
          <DialogTitle>
            {selectedProperty.title}
            <IconButton aria-label="close" onClick={handleCloseModal} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {selectedProperty.images?.map((img, index) => (
                <Grid item xs={6} key={index}>
                  <CardMedia component="img" image={`http://localhost:5000/${img}`} alt={selectedProperty.title} sx={{ width: '100%', height: 'auto' }} />
                </Grid>
              ))}
            </Grid>
            <Typography variant="body1" sx={{ mt: 2 }}>{selectedProperty.description}</Typography>
            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>{selectedProperty.price}ETB</Typography>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default PropertyList;
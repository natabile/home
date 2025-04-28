import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, CircularProgress, Alert, Box, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PropertyCard from '../componet/PropertyCard';
import PropertyMessages from '../componet/PropertyMessages';
import { useNavigate } from 'react-router-dom';

const MyPosts = () => {
  const [properties, setProperties] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMessages = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Fetching messages for property:', propertyId);
      const response = await axios.get(`http://localhost:5000/api/chat/property-messages/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Messages response:', response.data);
      setMessages(prev => ({
        ...prev,
        [propertyId]: response.data || []
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response?.status === 404) {
        // If no messages found, set empty array
        setMessages(prev => ({
          ...prev,
          [propertyId]: []
        }));
      } else {
        setError('Failed to fetch messages. Please try again later.');
      }
    }
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/properties/my-properties`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data) {
          setProperties(Array.isArray(response.data) ? response.data : [response.data]);
          // Fetch messages for each property
          if (Array.isArray(response.data)) {
            response.data.forEach(property => {
              fetchMessages(property._id);
            });
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setError(error.response?.data?.message || 'Failed to fetch your properties. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [navigate]);

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

  if (properties.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">You haven't posted any properties yet.</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Properties
      </Typography>
      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} key={property._id}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ width: '100%' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <PropertyCard
                        property={property}
                        showChat={false}
                      />
                    </Grid>
                    <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6">
                        {messages[property._id]?.length || 0} Messages
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <PropertyMessages
                  property={property}
                  messages={messages[property._id] || []}
                  onMessageSent={() => fetchMessages(property._id)}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MyPosts;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  CircularProgress,
  Alert,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Paper,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PropertyCard from '../componet/PropertyCard';
import PropertyMessages from '../componet/PropertyMessages';
import { useNavigate } from 'react-router-dom';

const MyPosts = () => {
  const [properties, setProperties] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  const fetchMessages = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/chat/property-messages/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => ({
        ...prev,
        [propertyId]: response.data || []
      }));
    } catch (error) {
      if (error.response?.status === 404) {
        setMessages(prev => ({
          ...prev,
          [propertyId]: []
        }));
      } else {
        setError('Failed to fetch messages. Please try again later.');
      }
    }
  };

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
        const dataArray = Array.isArray(response.data) ? response.data : [response.data];
        setProperties(dataArray);
        dataArray.forEach(property => {
          fetchMessages(property._id);
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch your properties. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [navigate]);

  const handleEditChange = (id, field, value) => {
    setEditData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const { title, description, price } = editData[id] || {};
      await axios.put(`http://localhost:5000/api/properties/my-properties/${id}`, { title, description, price }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProperties();
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/properties/my-properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress color="secondary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ bgcolor: '#FFEBEE', color: '#C62828' }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (properties.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}>
          You haven't posted any properties yet.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#2C3E50', 
        fontWeight: 'bold',
        mb: 4,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1
      }}>
        My Properties
      </Typography>
      
      <Grid container spacing={4}>
        {properties.map((property) => (
          <Grid item xs={12} key={property._id}>
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Accordion sx={{ 
                bgcolor: '#F5F7FA',
                '&:hover': {
                  bgcolor: '#EBEDF0'
                }
              }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon color="primary" />}>
                  <Box sx={{ width: '100%', p: 2 }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <PropertyCard
                          property={property}
                          showChat={false}
                        />
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" sx={{ 
                            color: '#7F8C8D',
                            mb: 1,
                            fontWeight: 'medium'
                          }}>
                            Edit Property Details
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          
                          <TextField
                            fullWidth
                            label="Title"
                            value={editData[property._id]?.title ?? property.title}
                            onChange={(e) => handleEditChange(property._id, 'title', e.target.value)}
                            sx={{ mb: 2 }}
                            variant="outlined"
                            color="secondary"
                          />
                          <TextField
                            fullWidth
                            label="Description"
                            value={editData[property._id]?.description ?? property.description}
                            onChange={(e) => handleEditChange(property._id, 'description', e.target.value)}
                            multiline
                            rows={3}
                            sx={{ mb: 2 }}
                            variant="outlined"
                            color="secondary"
                          />
                          <TextField
                            fullWidth
                            label="Price"
                            value={editData[property._id]?.price ?? property.price}
                            onChange={(e) => handleEditChange(property._id, 'price', e.target.value)}
                            sx={{ mb: 3 }}
                            variant="outlined"
                            color="secondary"
                            type="number"
                          />
                          
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                              variant="contained" 
                              onClick={() => handleUpdate(property._id)}
                              sx={{
                                bgcolor: '#3498DB',
                                '&:hover': { bgcolor: '#2980B9' },
                                px: 3,
                                py: 1,
                                borderRadius: 1
                              }}
                            >
                              Update
                            </Button>
                            <Button 
                              variant="contained" 
                              onClick={() => handleDelete(property._id)}
                              sx={{
                                bgcolor: '#E74C3C',
                                '&:hover': { bgcolor: '#C0392B' },
                                px: 3,
                                py: 1,
                                borderRadius: 1
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                        
                        <Box sx={{ 
                          bgcolor: '#E3F2FD',
                          p: 2,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Typography variant="subtitle1" sx={{ color: '#1976D2' }}>
                            {messages[property._id]?.length || 0} Messages
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails sx={{ bgcolor: '#FAFAFA', p: 0 }}>
                  <PropertyMessages
                    property={property}
                    messages={messages[property._id] || []}
                    onMessageSent={() => fetchMessages(property._id)}
                  />
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MyPosts;
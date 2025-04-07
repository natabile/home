import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, Box, Card, CardContent, MenuItem, Alert } from '@mui/material';
import axios from 'axios';

const PostPropertyForm = ({ userToken }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [subscriptionType, setSubscriptionType] = useState('one-time');
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userToken) {
      setError('You must be logged in to post a property');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('subscriptionType', subscriptionType);

    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    try {
      await axios.post('http://localhost:5000/api/properties/post', formData, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Property posted successfully');
      setTitle('');
      setDescription('');
      setPrice('');
      setImages([]);
      setSubscriptionType('one-time');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5" p={3}>
      <Card sx={{ width: '100%', maxWidth: 500, p: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" gutterBottom>
            Post a Property
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Title"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Price ($)"
                  type="number"
                  fullWidth
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" component="label" fullWidth>
                  Upload Images
                  <input
                    type="file"
                    multiple
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Subscription Type"
                  select
                  fullWidth
                  value={subscriptionType}
                  onChange={(e) => setSubscriptionType(e.target.value)}
                >
                  <MenuItem value="one-time">One-Time</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Post Property
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PostPropertyForm;

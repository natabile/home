import React, { useState } from 'react';
import {
  TextField, Button, Grid, Typography, Box, Card,
  CardContent, MenuItem, Alert, Stack
} from '@mui/material';
import axios from 'axios';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const LocationSelector = ({ setLocation }) => {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const PostPropertyForm = ({ userToken }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [subscriptionType, setSubscriptionType] = useState('one-time');
  const [location, setLocation] = useState({ lat: null, lng: null });
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

    if (location.lat && location.lng) {
      formData.append('latitude', location.lat);
      formData.append('longitude', location.lng);
    }

    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    try {
      await axios.post('http://localhost:5000/api/properties/post', formData, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Property posted successfully');
      setTitle('');
      setDescription('');
      setPrice('');
      setImages([]);
      setSubscriptionType('one-time');
      setLocation({ lat: null, lng: null });
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f9f9f9" p={3}>
      <Card sx={{ width: '100%', maxWidth: 700, borderRadius: 4, boxShadow: 4 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
            Post a Property
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <TextField
                label="Description"
                multiline
                fullWidth
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <TextField
                label="Price ETB"
                type="number"
                fullWidths
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <Box>
                <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none' }}>
                  Upload Images
                  <input
                    type="file"
                    multiple
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {images.length > 0 && (
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                    {images.length} image{images.length > 1 ? 's' : ''} selected
                  </Typography>
                )}
              </Box>

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

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Select Property Location (optional):
                </Typography>

                <MapContainer
                  center={[9.03, 38.74]}
                  zoom={13}
                  scrollWheelZoom
                  style={{ height: '400px', width: '100%', borderRadius: 8, border: '1px solid #ccc' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationSelector setLocation={setLocation} />
                  {location.lat && <Marker position={[location.lat, location.lng]} />}
                </MapContainer>

                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {location.lat && location.lng
                    ? `Selected: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                    : 'No location selected'}
                </Typography>
              </Box>

              <Button type="submit" variant="contained" fullWidth size="large" sx={{ py: 1.5 }}>
                Post Property
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PostPropertyForm;

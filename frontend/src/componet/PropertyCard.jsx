import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Button,
  Chip,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
// Fix leaflet marker icons in React environment
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const PropertyCard = ({ property, showChat, onChatClick }) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);

  // First image or placeholder
  const displayImage = property.images && property.images.length > 0
    ? `http://localhost:5000/${property.images[0]}`
    : 'https://via.placeholder.com/300x200?text=No+Image';

  const handleImageClick = () => {
    if (property.images && property.images.length > 0) {
      setIsImageDialogOpen(true);
    }
  };

  const handleCloseImageDialog = () => {
    setIsImageDialogOpen(false);
  };

  const handleOpenLocationDialog = () => {
    setIsLocationDialogOpen(true);
  };

  const handleCloseLocationDialog = () => {
    setIsLocationDialogOpen(false);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={displayImage}
        alt={property.title}
        onClick={handleImageClick}
        sx={{ cursor: 'pointer' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {property.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {property.description}
        </Typography>
        <Typography variant="h6" color="primary" gutterBottom>
          {property.price} ETB
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PersonIcon color="primary" />
          <Typography variant="body2" color="text.secondary">
            Posted by: {property.postedBy?.username || 'Unknown'}
          </Typography>

          {/* Location icon */}
          {property.latitude && property.longitude && (
            <Tooltip title="View Location on Map">
              <IconButton color="primary" onClick={handleOpenLocationDialog} size="small" sx={{ ml: 1 }}>
                <LocationOnIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {showChat && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => onChatClick(property)}
          >
            Contact Owner
          </Button>
        )}
      </CardContent>

      {/* Image Gallery Dialog */}
      <Dialog
        open={isImageDialogOpen}
        onClose={handleCloseImageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {property.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseImageDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {property.images?.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <img
                  src={`http://localhost:5000/${image}`}
                  alt={`${property.title} - Image ${index + 1}`}
                  style={{ width: '100%', height: 'auto' }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Location Dialog with Map */}
      <Dialog
        open={isLocationDialogOpen}
        onClose={handleCloseLocationDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Location of {property.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseLocationDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ height: 400, p: 0 }}>
          {property.latitude && property.longitude ? (
            <MapContainer
              center={[property.latitude, property.longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[property.latitude, property.longitude]} />
            </MapContainer>
          ) : (
            <Typography sx={{ p: 2 }}>
              Location data is not available.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PropertyCard;

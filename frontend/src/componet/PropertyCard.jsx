// src/components/PropertyCard.jsx
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
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

const PropertyCard = ({ property, showChat, onChatClick }) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  // Get the first image from the property's images array
  const displayImage = property.images && property.images.length > 0 
    ? `http://localhost:5000/${property.images[0]}` 
    : 'https://via.placeholder.com/300x200?text=No+Image';

  const handleImageClick = () => {
    if (property.images && property.images.length > 0) {
      setIsImageDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsImageDialogOpen(false);
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

      <Dialog 
        open={isImageDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {property.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
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
    </Card>
  );
};

export default PropertyCard;

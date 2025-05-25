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
  Tooltip,
  Avatar,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
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
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
      }
    }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="220"
          image={displayImage}
          alt={property.title}
          onClick={handleImageClick}
          sx={{ 
            cursor: property.images?.length ? 'pointer' : 'default',
            objectFit: 'cover',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
          }}
        />
        {property.images?.length > 0 && (
          <Tooltip title="View all images">
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255,255,255,0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
              onClick={handleImageClick}
            >
              <ZoomInIcon color="primary" />
            </IconButton>
          </Tooltip>
        )}
        <Chip
          label={`${property.price} ETB`}
          color="primary"
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            fontWeight: 'bold',
            fontSize: '1rem',
            px: 2,
            py: 1,
            backgroundColor: 'primary.main',
            color: 'white'
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography 
          gutterBottom 
          variant="h5" 
          component="div"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 2,
            minHeight: '64px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {property.title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          paragraph
          sx={{
            mb: 3,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '60px'
          }}
        >
          {property.description}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Avatar sx={{ 
            width: 32, 
            height: 32,
            bgcolor: 'primary.light',
            color: 'primary.dark'
          }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {property.postedBy?.username || 'Unknown'}
          </Typography>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {property.latitude && property.longitude && (
            <Tooltip title="View location on map">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<LocationOnIcon />}
                onClick={handleOpenLocationDialog}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2
                }}
              >
                View Location
              </Button>
            </Tooltip>
          )}
          
          {showChat && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => onChatClick(property)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }
              }}
            >
              Contact Owner
            </Button>
          )}
        </Box>
      </CardContent>

      {/* Image Gallery Dialog */}
      <Dialog
        open={isImageDialogOpen}
        onClose={handleCloseImageDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {property.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseImageDialog}
            sx={{
              color: 'white'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {property.images?.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 1,
                  height: '100%'
                }}>
                  <img
                    src={`http://localhost:5000/${image}`}
                    alt={`${property.title} - Image ${index + 1}`}
                    style={{ 
                      width: '100%', 
                      height: '200px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </Box>
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Location of {property.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseLocationDialog}
            sx={{
              color: 'white'
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
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              p: 3
            }}>
              <Typography variant="body1" color="text.secondary">
                Location data is not available.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PropertyCard;
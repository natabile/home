// src/components/PropertyCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';

const PropertyCard = ({ property, onChat }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{property.title}</Typography>
        <Typography>{property.description}</Typography>
        <Typography>Price: ${property.price}</Typography>
        <Button variant="contained" color="primary" onClick={() => onChat(property)}>
          Chat with Owner
        </Button>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;

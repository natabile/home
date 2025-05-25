import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  Paper,
} from '@mui/material';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const FeatureBox = ({ icon, title, description }) => (
  <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
    {icon}
    <Typography variant="h6" sx={{ mt: 1 }}>{title}</Typography>
    <Typography variant="body2" color="textSecondary">{description}</Typography>
  </Paper>
);

const Home = () => {
  return (
    <>
      {/* Navbar */}
      <Box sx={{ py: 2, px: 3, bgcolor: '#263238', color: 'white' }}>
        <Typography variant="h6">🏠 Home Rental & Selling</Typography>
      </Box>

      {/* Hero */}
      <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#ECEFF1' }}>
        <Container>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Find Your Ideal Home
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Rent or Buy. Trusted listings. Easy connection.
          </Typography>
          <Button variant="contained" size="large" sx={{ mt: 3 }}>
            Browse Listings
          </Button>
        </Container>
      </Box>

      {/* Benefits */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FeatureBox
              icon={<SearchIcon fontSize="large" color="primary" />}
              title="Smart Search"
              description="Search by location, price, and home features in seconds."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureBox
              icon={<ChatIcon fontSize="large" color="primary" />}
              title="Chat with Sellers"
              description="Contact owners or agents directly inside the app."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureBox
              icon={<VerifiedUserIcon fontSize="large" color="primary" />}
              title="Verified Listings"
              description="All listings are verified to avoid scams and fraud."
            />
          </Grid>
        </Grid>
      </Container>

      {/* How it Works */}
      <Box sx={{ bgcolor: '#f9f9f9', py: 6 }}>
        <Container>
          <Typography variant="h5" textAlign="center" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FeatureBox
                icon={<SearchIcon fontSize="large" color="secondary" />}
                title="1. Search"
                description="Filter listings by location, price, and type."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureBox
                icon={<ChatIcon fontSize="large" color="secondary" />}
                title="2. Contact"
                description="Chat with the seller or agent for details."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureBox
                icon={<HomeWorkIcon fontSize="large" color="secondary" />}
                title="3. Move In"
                description="Visit, finalize the deal, and move in with ease!"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box sx={{ py: 6, bgcolor: '#263238', color: 'white', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Ready to find your dream home?
        </Typography>
        <Button variant="contained" color="primary" size="large">
          Start Now
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 2, textAlign: 'center', bgcolor: '#1c1c1c', color: 'white' }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} Home Rental & Selling. All rights reserved.
        </Typography>
      </Box>
    </>
  );
};

export default Home;

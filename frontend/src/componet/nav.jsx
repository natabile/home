import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Property Listings
        </Typography>
        <Box>
          {/* Link components for navigation */}
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/properties">
            Properties
          </Button>
          <Button color="inherit" component={Link} to="/post-property">
            Post Property
          </Button>
          <Button color="inherit" component={Link} to="/owner-messages">
            my message
          </Button>

          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>

        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

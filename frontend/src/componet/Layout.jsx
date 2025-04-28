import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './nav';
import { Box } from '@mui/material';

const Layout = () => {
  return (
    <Box>
      <Navbar />
      <Outlet />
    </Box>
  );
};

export default Layout;

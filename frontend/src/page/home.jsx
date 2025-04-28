import { Button, Typography, Container, Grid, Box } from "@mui/material";

const Home = () => {
  return (
    <>
      <Box sx={{ padding: "10px", backgroundColor: "#3f51b5", color: "white" }}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Home Rental & Selling</Typography>

        </nav>
      </Box>


      {/* Hero Section */}
      <Container sx={{ textAlign: "center", marginTop: "50px" }}>
        <Typography variant="h2" gutterBottom>
          Welcome to Home Rental & Selling Platform
        </Typography>
        <Typography variant="h5" paragraph>
          Find your dream home to rent or buy. Browse listings, connect with agents, and make your dream of owning or renting a home a reality.
        </Typography>

        {/* Descriptions */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ padding: "20px", backgroundColor: "#f4f4f4", borderRadius: "8px" }}>
              <Typography variant="h4" gutterBottom>
                Rent a Home
              </Typography>
              <Typography>
                Discover a wide variety of rental properties available in your desired location. Whether you are looking for a cozy apartment or a spacious house, we have options for every budget.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ padding: "20px", backgroundColor: "#f4f4f4", borderRadius: "8px" }}>
              <Typography variant="h4" gutterBottom>
                Buy a Home
              </Typography>
              <Typography>
                Explore our collection of homes for sale. We provide listings for homes in prime locations with various price ranges. Find your perfect home today!
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ marginTop: "50px", backgroundColor: "#3f51b5", padding: "10px", color: "white", textAlign: "center" }}>
        <Typography variant="body1">
          &copy; 2025 Home Rental & Selling Platform | All Rights Reserved
        </Typography>
      </Box>
    </>
  );
};

export default Home;

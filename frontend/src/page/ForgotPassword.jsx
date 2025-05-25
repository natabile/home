import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { TextField, Button, Typography, Box, Container } from "@mui/material";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send reset email");
    }
  };

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 4,
          p: 4,
          borderRadius: '16px',
          boxShadow: 3,
          bgcolor: 'background.paper',
          width: '100%',
          maxWidth: '400px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(227, 242, 253, 0.9))',
          border: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
          Forgot Password
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            required
            variant="outlined"
          />
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            type="submit"
            sx={{ mb: 2, borderRadius: '8px', padding: '10px' }}
          >
            Send Reset Link
          </Button>
        </form>

        {message && (
          <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}

        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Typography sx={{ mt: 2 }}>
          Remember your password?{" "}
          <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Login
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default ForgotPassword;

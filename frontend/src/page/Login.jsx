import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box, Container } from "@mui/material";
import imagelogin from "../assets/imagelogin.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("userId", response.data.user._id);
      localStorage.setItem("username", response.data.username);
      console.log("Setting Username:", response.data.username);
      if (response.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/properties");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed!");
    }
  };

  return (
    <Box sx={{ backgroundImage: `url(${imagelogin})`, }}>
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",

          backgroundSize: 'cover',
          backgroundPosition: 'center'
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
            Welcome Back
          </Typography>
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
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
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              required
              variant="outlined"
            />
            <Button variant="contained" color="primary" fullWidth type="submit" sx={{ mb: 2, borderRadius: '8px', padding: '10px' }}>
              Login
            </Button>
            
          </form>

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Typography sx={{ mt: 2 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>Register</Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
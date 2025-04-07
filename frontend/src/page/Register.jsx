import { useState } from "react";
import axios from "axios";
import { TextField, Button, Typography, Box, Container } from "@mui/material";
import imagelogin from "../assets/imagelogin.jpg";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
        username
      });

      console.log("Registration successful:", response.data);
      alert("Registration successful!");

      // Optionally clear form fields after successful registration
      setEmail("");
      setPassword("");
      setUsername("");
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <Box sx={{ backgroundImage: `url(${imagelogin})`, }}>
      <Container sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",

        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mt: 14,
            p: 3,
            borderRadius: "8px",
            boxShadow: 3,
            bgcolor: "background.paper"
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Register
          </Typography>

          <form onSubmit={handleRegister} style={{ width: "100%" }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Username"
              type="text"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 3 }}
              required
            />

            <Button variant="contained" color="primary" fullWidth type="submit">
              Register
            </Button>
          </form>

          {/* Error message displayed in red below the form */}
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 2 }}>
            Already have an account?{" "} <a href="/login">Login</a>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;

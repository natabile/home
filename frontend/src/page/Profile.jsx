import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Avatar,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  Alert,
  Stack,
  Divider
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    phone: "",
    location: "",
    avatar: ""
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const defaultAvatar = "https://img.icons8.com/color/96/000000/user.png";

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setFormData({
          displayName: response.data.profile?.displayName || "",
          bio: response.data.profile?.bio || "",
          phone: response.data.profile?.phone || "",
          location: response.data.profile?.location || "",
          avatar: response.data.profile?.avatar || ""
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUser(response.data);
      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile. Please try again.");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={1} sx={{ overflow: 'hidden' }}>
        {message && (
          <Alert 
            severity={message.includes("Error") ? "error" : "success"}
            sx={{ mb: 2 }}
          >
            {message}
          </Alert>
        )}

        <Box sx={{ bgcolor: 'primary.light', p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Container>
            <Stack direction="row" spacing={3} alignItems="center">
              <Box position="relative">
                <Avatar
                  src={user.profile?.avatar || defaultAvatar}
                  alt="Profile"
                  sx={{
                    width: 100,
                    height: 100,
                    border: 3,
                    borderColor: 'common.white',
                    boxShadow: 1
                  }}
                  imgProps={{
                    onError: (e) => {
                      console.log('Image load error, falling back to default');
                      e.target.src = defaultAvatar;
                    }
                  }}
                />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  {user.profile?.displayName || user.username}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  {user.email}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(!isEditing)}
                  sx={{ mt: 1 }}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </Box>
            </Stack>
          </Container>
        </Box>

        {isEditing ? (
          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 'md', mx: 'auto', p: 4 }}>
            <TextField
              fullWidth
              label="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />

            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Profile Image
              </Typography>
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<PhotoCamera />}
              >
                Upload Photo
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      // Check file size (25MB limit)
                      if (file.size > 25 * 1024 * 1024) {
                        setMessage("File size too large. Maximum size is 25MB.");
                        return;
                      }

                      const formData = new FormData();
                      formData.append('profileImage', file);

                      try {
                        const token = localStorage.getItem("token");
                        const response = await axios.post(
                          "http://localhost:5000/api/auth/profile/image",
                          formData,
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                              'Content-Type': 'multipart/form-data'
                            }
                          }
                        );
                        setUser(response.data.user);
                        setMessage("Profile image updated successfully!");
                        setTimeout(() => setMessage(""), 3000);
                      } catch (error) {
                        console.error("Error uploading image:", error);
                        setMessage(error.response?.data?.message || "Error uploading image");
                      }
                    }}
                />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Maximum size: 25MB
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              multiline
              rows={3}
              margin="normal"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ maxWidth: 'md', mx: 'auto', p: 3 }}>
            <Grid container spacing={4}>
              {user.profile?.phone && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>Phone</Typography>
                  <Typography color="text.secondary">{user.profile.phone}</Typography>
                </Grid>
              )}

              {user.profile?.location && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>Location</Typography>
                  <Typography color="text.secondary">{user.profile.location}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'divider', p: 2 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;

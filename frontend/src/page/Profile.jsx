import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
      } catch (error) {
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  return user ? (
    <div>
      <h2>Welcome, {user.email}</h2>
      <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>Logout</button>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Profile;

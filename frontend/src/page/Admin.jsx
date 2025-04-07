import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../componet/nav";

const Admin = () => {
  const [users, setUsers] = useState([]);  // State to hold list of users
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Decode the token to get the admin username
  const username = token ? JSON.parse(atob(token.split('.')[1])).username : null;

  useEffect(() => {
    if (!token || role !== "admin") {
      alert("Access Denied: Admins Only!");
      navigate("/"); // Redirect to home or login
      return;
    }

    // Fetch list of users (only usernames)
    axios.get("http://localhost:5000/api/auth/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUsers(res.data.users))  // Store list of users
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to fetch users");
      });
  }, [navigate, token, role]);

  return (
    <div>
      <Navbar />
      <h2>Admin Panel</h2>
      {username && <h3>Welcome, {username}!</h3>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Display list of users */}
      {users.length > 0 ? (
        <div>
          <h4>Registered Users:</h4>
          <ul>
            {users.map((user, index) => (
              <ol key={index}>{user.username}</ol>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading users...</p>
      )}
    </div>
  );
};

export default Admin;

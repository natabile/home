import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./page/home";
import Login from "./page/Login";
import Register from "./page/Register";
import Profile from "./page/Profile";
import Admin from "./page/Admin";
import PostProperty from "./page/PostProperty";
import PropertyList from "./page/PropertyList";
import MyPosts from "./page/MyPosts";
import MyMessages from "./page/MyMessages";
import ForgotPassword from "./page/ForgotPassword";
import ResetPassword from "./page/ResetPassword";
import Layout from "./componet/Layout";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/post-property" element={<PostProperty />} />
          <Route path="/properties" element={<PropertyList />} />
          <Route path="/my-posts" element={<MyPosts />} />
          <Route path="/my-messages" element={<MyMessages />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;

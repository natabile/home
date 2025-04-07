import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./page/home";
import Login from "./page/Login";
import Register from "./page/Register";
import Profile from "./page/Profile";
import Admin from "./page/Admin";
import PostProperty from "./page/PostProperty";
import PropertyList from "./page/PropertyList";
import Chat from "./componet/Chat";
import OwnerMessages from "./page/Ownermessage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/post-property" element={<PostProperty />} />
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/chat/:chatId" element={<Chat />} />
        <Route path="/owner-messages" element={<OwnerMessages />} />


      </Routes>
    </Router>
  );
};

export default AppRoutes;

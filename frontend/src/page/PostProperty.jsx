import React, { useState } from 'react';
import PostPropertyForm from '../componet/PostPropertyForm';
import Navbar from '../componet/nav';

const PostProperty = () => {
  const [userToken, setUserToken] = useState(localStorage.getItem('token') || '');  // Get token from localStorage directly

  return (
    <div>
      <Navbar />
      <PostPropertyForm userToken={userToken} />
    </div>
  );
};

export default PostProperty;

import React, { useState } from 'react';
import PostPropertyForm from '../componet/PostPropertyForm';

const PostProperty = () => {
  const [userToken, setUserToken] = useState(localStorage.getItem('token') || '');  // Get token from localStorage directly

  return (
    <div>
      <PostPropertyForm userToken={userToken} />
    </div>
  );
};

export default PostProperty;

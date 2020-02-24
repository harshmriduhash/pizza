import React from 'react';
import { Link } from 'react-router';

const LogOut = () =>
  <div>
    <div>You have successfully signed out</div>
    <Link to="/login">
      Sign in with a different account
    </Link>
  </div>;

export default LogOut;

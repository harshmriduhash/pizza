import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import styles from 'styles/dashboard-header.module.css';

const Header = (props) =>
  <header className={styles.topbar}>
    <div className={styles.logoContainer}>
      <Link to="/dashboard">
        <img
          src="/public/Hungrybot_logo2.png"
          alt="Hungrybot logo"
          className={styles.logo}
        />
      </Link>
    </div>
    <span className={styles.user}>
      Hi, {props.twitch}!
    </span>
  </header>;

Header.propTypes = {
  twitch: PropTypes.string,
};

export default Header;

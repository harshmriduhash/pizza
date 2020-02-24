import React from 'react';
import styles from 'styles/header.module.css';

const Header = () =>
  <div className={styles.topbar}>
    <a href="http://www.hungrybot.co">
      <img
        src="/public/Hungrybot_logo2.png"
        alt="Hungrybot logo"
        className={styles.logo}
      />
    </a>
  </div>;

export default Header;

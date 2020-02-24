import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import styles from 'styles/sidebar.module.css';

const Sidebar = (props) => {
  const currentLocation = props.path;

  return (
    <nav className={styles.sidebar}>
      <Link
        className={currentLocation === '/dashboard' ? styles.activeContainer : styles.linkContainer}
        to="/dashboard"
      >
        <i className="fa fa-bar-chart" aria-hidden="true"></i>
        <span className={styles.linkContent}>Overview</span>
      </Link>
      <Link
        className={currentLocation === '/dashboard/setup' ? styles.activeContainer : styles.linkContainer}
        to="/dashboard/setup"
      >
        <i className="fa fa-cog" aria-hidden="true"></i>
        <span className={styles.linkContent}>Settings</span>
      </Link>
    </nav>
  );
};

Sidebar.propTypes = {
  path: PropTypes.string,
};

export default Sidebar;

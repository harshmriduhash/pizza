import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Header from 'components/DashboardComponents/Header/Header';
import Sidebar from 'components/DashboardComponents/Sidebar/Sidebar';
import Footer from 'components/DashboardComponents/Footer/Footer';
import styles from 'styles/dashboard.module.css';
import 'font-awesome/css/font-awesome.css';

// eslint-disable-next-line
class Dashboard extends Component {
  render() {
    return (
      <div className={styles.body}>
        <Header twitch={this.props.user.twitch} />
        <div className={styles.dashboard}>
          <div className={styles.content}>
            {this.props.children}
          </div>
          <Sidebar path={this.props.location.pathname} />
        </div>
        <Footer />
      </div>
    );
  }
}

Dashboard.propTypes = {
  user: PropTypes.object,
  children: PropTypes.object,
  location: PropTypes.object,
};

function mapStateToProps({ user }) {
  return {
    user,
  };
}

export default connect(mapStateToProps, {})(Dashboard);

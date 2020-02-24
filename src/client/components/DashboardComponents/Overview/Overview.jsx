import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import styles from 'styles/dashboardstep.module.css';

import {
  updateSettings,
  advertiseOnce,
  toggleAdvertisements,
} from 'actions/users';

class Overview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      togglingAds: false,
    };

    this.elements = {};
    this.advertise = this.advertise.bind(this);
    this.toggleChannelAdvertisements = this.toggleChannelAdvertisements.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.user.isWaiting) {
      this.setState({
        togglingAds: false,
      });
    }
  }

  advertise() {
    this.props.advertiseOnce();
  }

  toggleChannelAdvertisements() {
    this.setState({
      togglingAds: true,
    });

    this.props.toggleAdvertisements(!this.props.user.adsEnabled);
  }

  render() {
    const user = this.props.user;
    let toggleButtonText;
    if (this.state.togglingAds) {
      toggleButtonText = 'Loading...';
    } else if (user.adsEnabled) {
      toggleButtonText = 'Turn off';
    } else {
      toggleButtonText = 'Turn on';
    }

    const updated = this.props.location.query.updated === '1'
      ? <div className={styles.notification}>Your settings have been updated</div>
      : '';

    return (
      <div className={styles.container}>
        <div className={styles.header}>Overview</div>
        <hr className={styles.break} />
        <div className={styles.content}>
          {updated}
          <div className={styles.section}>Hungrybot is messaging chat every {user.cadence} minutes</div>
          <div className={styles.section}>Turn off Hungrybot chat messaging</div>
          <div className={styles.section}>
            <button
              className={styles.button}
              onClick={this.toggleChannelAdvertisements}
              disabled={this.state.togglingAds}
            >
              {toggleButtonText}
            </button>
          </div>
          <div className={styles.section}>Make Hungrybot manually message chat</div>
          <div className={styles.section}>
            <button
              className={styles.button}
              onClick={this.advertise}
              disabled={this.state.advertising}
            >
              Message now
            </button>
          </div>
        </div>
      </div>
    );
  }
}

Overview.propTypes = {
  user: PropTypes.object,
  updateSettings: PropTypes.func,
  advertiseOnce: PropTypes.func,
  toggleAdvertisements: PropTypes.func,
  location: PropTypes.object,
};

function mapStateToProps({ user }) {
  return {
    user,
  };
}

export default connect(mapStateToProps, {
  updateSettings,
  advertiseOnce,
  toggleAdvertisements,
})(Overview);

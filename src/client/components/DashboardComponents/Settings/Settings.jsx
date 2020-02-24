import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import styles from 'styles/dashboardstep.module.css';

import {
  detectModeratorStatus,
  joinChannel,
  updateSettings,
} from 'actions/users';

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      joiningChannel: false,
      checkingModerator: false,
      updatingSettings: false,
    };

    this.elements = {};
    this.checkForModeratorStatus = this.checkForModeratorStatus.bind(this);
    this.joinUserChannel = this.joinUserChannel.bind(this);
    this.updateBotSettings = this.updateBotSettings.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.user.isWaiting) {
      this.setState({
        joiningChannel: false,
        checkingModerator: false,
        updateSettings: false,
      });
    }
  }

  checkForModeratorStatus() {
    this.setState({
      checkingModerator: true,
    });

    this.props.detectModeratorStatus();
  }

  joinUserChannel() {
    this.setState({
      joiningChannel: true,
    });

    this.props.joinChannel();
  }

  updateBotSettings(event) {
    event.preventDefault();

    this.setState({
      updatingSettings: true,
    });

    this.props.updateSettings({
      cadence: this.elements.cadence.value,
      paypal: this.elements.paypal.value,
    }, true);
  }

  render() {
    const user = this.props.user;
    const isBotPresent = user.isBotPresent;
    const isModerator = user.isModerator;

    let joinButtonText;
    if (this.state.joiningChannel) {
      joinButtonText = 'Loading...';
    } else if (isBotPresent) {
      joinButtonText = 'Joined channel';
    } else {
      joinButtonText = 'Join channel';
    }

    let moderatorButtonText;
    if (this.state.checkingModerator) {
      moderatorButtonText = 'Loading...';
    } else if (isModerator) {
      moderatorButtonText = 'Moderator status confirmed';
    } else {
      moderatorButtonText = 'Check for moderator status';
    }

    let submitButtonText;
    if (this.state.updatingSettings) {
      submitButtonText = 'Loading...';
    } else {
      submitButtonText = 'Update settings';
    }

    return (
      <div className={styles.container}>
        <div className={styles.header}>Hungrybot setup</div>
        <hr className={styles.break} />
        <div className={styles.content}>
          <div className={styles.section}>
            Click the button below to have Hungrybot join your channel.
          </div>
          <div className={styles.section}>
            <button
              className={styles.button}
              disabled={this.state.joiningChannel || isBotPresent}
              onClick={this.joinUserChannel}
              ref={(input) => { this.elements.joinButton = input; }}
            >
              {joinButtonText}
            </button>
          </div>
          <div className={styles.section}>
            Mod Hungrybot by typing /mod the_hungrybot in your channel.
            <p>Then, confirm Hungrybot's moderator status by clicking the button below.</p>
            <p>You may need to check multiple times.</p>
          </div>
          <div className={styles.section}>
            <button
              className={styles.button}
              onClick={this.checkForModeratorStatus}
              disabled={this.state.checkingModerator || !isBotPresent || isModerator}
              ref={(input) => { this.elements.moderatorButton = input; }}
            >
              {moderatorButtonText}
            </button>
          </div>
        </div>
        <div className={styles.header}>Settings</div>
        <hr className={styles.break} />
        <form className={styles.content} onSubmit={this.updateBotSettings}>
          <div className={styles.section}>
            Hungrybot messages chat periodically to let viewers know they can order from
            it by typing !pizza in chat.
            <p>How often should it do that?</p>
          </div>
          <div className={styles.section}>
            <select
              className={styles.select}
              ref={(input) => { this.elements.cadence = input; }}
              defaultValue={user.cadence}
            >
              <option value="30">Every 30 minutes</option>
              <option value="60">Every 60 minutes</option>
              <option value="90">Every 90 minutes</option>
              <option value="120">Every 120 minutes</option>
              <option value="0">Never advertise</option>
            </select>
          </div>
          <div className={styles.section}>
            If your PayPal email address is different than your twitch email address, add it below.
          </div>
          <div className={styles.section}>
            <input
              type="email"
              className={styles.formElement}
              ref={(input) => { this.elements.paypal = input; }}
              defaultValue={user.paypal}
              placeholder="(Optional) Paypal email address"
            />
          </div>
          <div className={styles.centeredSection}>
            <input
              type="submit"
              className={styles.button}
              disabled={this.state.updatingSettings || !isBotPresent || !isModerator}
              ref={(input) => { this.elements.submit = input; }}
              value={submitButtonText}
            />
          </div>
        </form>
      </div>
    );
  }
}

Settings.propTypes = {
  user: PropTypes.object,
  detectModeratorStatus: PropTypes.func,
  joinChannel: PropTypes.func,
  updateSettings: PropTypes.func,
};

function mapStateToProps({ user }) {
  return {
    user,
  };
}

export default connect(mapStateToProps, {
  detectModeratorStatus,
  joinChannel,
  updateSettings,
})(Settings);

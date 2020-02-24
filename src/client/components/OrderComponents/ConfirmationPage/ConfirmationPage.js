import React, { Component, PropTypes } from 'react';
import DeliveryConfirmation from '../DeliveryConfirmation/DeliveryConfirmation';

const styles = {};
import baseStyles from 'styles/order.module.css';
import confirmationPageStyles from 'styles/confirmationpage.module.css';
Object.assign(styles, baseStyles, confirmationPageStyles);

// eslint-disable-next-line
class ConfirmationPage extends Component {
  render() {
    const order = this.props.order;

    return (
      <div className={styles.content}>
        <DeliveryConfirmation
          order={order}
          trackerUrl=""
        />
        <div className={styles.sectionContent}>
          <div className={styles.contentHeader}>
            <i className="fa fa-heart" aria-hidden="true"></i>
            Donation
          </div>
          <div>
            You donated ${this.props.optionalDonation.toFixed(2)} to {this.props.streamerId}!
          </div>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.contentHeader}>
            <i className="fa fa-envelope" aria-hidden="true"></i>
            Contact us
          </div>
          <div>
            Questions? Feedback? Email us
            at <a href="mailto:john@septur.com" className={styles.contactLink}>john@septur.com</a>!
          </div>
        </div>
      </div>
    );
  }
}

ConfirmationPage.propTypes = {
  order: PropTypes.object,
  streamerId: PropTypes.string,
  optionalDonation: PropTypes.number,
};

export default ConfirmationPage;

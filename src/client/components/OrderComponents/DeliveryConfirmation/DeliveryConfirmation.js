import React, { PropTypes } from 'react';

const styles = {};
import baseStyles from 'styles/order.module.css';
import confirmationStyles from 'styles/deliveryconfirmation.module.css';
Object.assign(styles, baseStyles, confirmationStyles);

const DeliveryConfirmation = (props) => {
  let trackSection;
  if (props.trackerUrl) {
    trackSection = (
      <div>
        Track your order <a href={props.trackerUrl} target="_blank">here</a>.
      </div>
    );
  } else {
    trackSection = (
      <div>
        A link to track your order at dominos.com will be whispered from Hungrybot back on Twitch.
      </div>
    );
  }

  const order = props.order;

  return (
    <div className={styles.deliveryContent}>
      <div className={styles.contentHeader}>
        <i className="fa fa-truck" aria-hidden="true"></i>
        Delivery information
      </div>
      <div className={styles.deliverySection}>
        Your order has been placed. Enjoy your pizza!
      </div>
      <div className={styles.deliverySection}>
        <div className={styles.subHeader}>
          Delivery instructions
        </div>
        {order.instructions ? order.instructions : 'None.'}
      </div>
      <div className={styles.deliverySection}>
        <div className={styles.subHeader}>
          Estimated wait
        </div>
        Your pizza will be ready in {order.estimatedTime} minutes.
      </div>
      <div className={styles.deliverySection}>
        <div className={styles.subHeader}>
          Track your order
        </div>
        {trackSection}
      </div>
    </div>
  );
};

DeliveryConfirmation.propTypes = {
  order: PropTypes.object,
  trackerUrl: PropTypes.string,
};

export default DeliveryConfirmation;

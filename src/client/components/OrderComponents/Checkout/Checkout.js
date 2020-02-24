/* global Stripe, __STRIPE_PUB_KEY__ */
import React, { Component, PropTypes } from 'react';

const styles = {};
import baseStyles from 'styles/order.module.css';
import checkoutStyles from 'styles/checkout.module.css';
Object.assign(styles, baseStyles, checkoutStyles);

class Checkout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
    };

    this.elements = {};
    this.onSubmit = this.onSubmit.bind(this);
    this.onToken = this.onToken.bind(this);
  }

  componentDidMount() {
    Stripe.setPublishableKey(__STRIPE_PUB_KEY__);
  }

  onCollapsedClick() {
    this.props.setOrderStep(3);
  }

  onSubmit(event) {
    if (event.preventDefault) {
      event.preventDefault();
    }

    const expiry = this.elements.expiry.value.split('/');
    if (expiry.length !== 2) {
      this.setState({
        error: 'Invalid expiration date, please enter a date in MM/YY format',
      });
    } else if (Number(expiry[0]) < 1 || Number(expiry[0]) > 12) {
      this.setState({
        error: 'Invalid expiration month',
      });
    } else {
      // disable the submit button to prevent additional payments
      this.toggleSubmit(false);

      Stripe.card.createToken({
        number: this.elements.cardNumber.value,
        cvc: this.elements.cvc.value,
        exp_month: expiry[0],
        exp_year: expiry[1],
        address_zip: this.elements.zipCode.value,
      }, this.onToken);
    }

    return false;
  }

  onToken(status, stripeResponse) {
    if (stripeResponse.error) {
      console.log(stripeResponse.error);

      this.toggleSubmit(true);
      this.setState({
        error: stripeResponse.error.message,
      });

      return;
    }

    const token = stripeResponse.id;

    fetch('/checkout', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        orderId: this.props.order.orderId,
        optionalDonation: this.props.optionalDonation,
      }),
    })
    .then((response) => response.json())
    .then((json) => {
      if (json.success) {
        this.props.setOrderStep(4);
      } else {
        console.log(json);
        this.toggleSubmit(true);
      }
    })
    .catch((error) => {
      console.log('Error parsing the response', error);
      this.toggleSubmit(true);
    });
  }

  toggleSubmit(enabled) {
    if (enabled) {
      this.elements.submit.disabled = false;
      this.elements.submit.value = 'Complete order';
    } else {
      this.elements.submit.disabled = true;
      this.elements.submit.value = 'Loading...';
    }
  }

  render() {
    const errorStyle = {
      display: this.state.error ? 'block' : 'none',
    };

    if (!this.props.isActiveSection) {
      return (
        <div className={styles.collapsedSection}>
          <i className="fa fa-credit-card" aria-hidden="true"></i>
          Payment
        </div>
      );
    }

    return (
      <div className={styles.sectionContent}>
        <div className={styles.contentHeader}>
          <i className="fa fa-credit-card" aria-hidden="true"></i>
          Payment
          <a href="https://stripe.com" target="_blank" >
            <img src="/public/outline.png" role="presentation" className={styles.stripe} />
          </a>
        </div>
        <p
          ref={(input) => { this.elements.error = input; }}
          className={styles.error}
          style={errorStyle}
        >
          {this.state.error}
        </p>
        <div className={styles.moreInfo}>
          Your payment is processed securely by <a href="https://stripe.com/docs/security" target="_blank"><b>Stripe</b></a>
        </div>
        <form
          onSubmit={this.onSubmit}
          ref={(form) => { this.elements.form = form; }}
        >
          <input
            type="tel"
            ref={(input) => { this.elements.cardNumber = input; }}
            placeholder="Card number"
            className={styles.formField}
            maxLength="20"
            autoFocus
            required
          />
          <div className={styles.formContainer}>
            <input
              type="text"
              ref={(input) => { this.elements.expiry = input; }}
              placeholder="Expiration date (MM/YY)"
              className={styles.expiration}
              pattern="^\d?\d/\d{2}$"
              maxLength="5"
              required
            />
            <input
              type="tel"
              ref={(input) => { this.elements.cvc = input; }}
              placeholder="CVC"
              className={styles.cvc}
              maxLength="4"
              required
            />
          </div>
          <input
            type="tel"
            ref={(input) => { this.elements.zipCode = input; }}
            placeholder="Billing ZIP"
            className={styles.zipCode}
            pattern="^\d{5}$"
            maxLength="5"
            required
          />
          <hr className={styles.break} />
          <div className={styles.submitContainer}>
            <input
              type="submit"
              className={styles.submitButton}
              ref={(input) => { this.elements.submit = input; }}
              value="Complete order"
            />
          </div>
        </form>
      </div>
    );
  }
}

Checkout.propTypes = {
  order: PropTypes.object,
  optionalDonation: PropTypes.number,
  isActiveSection: PropTypes.bool,
  setOrderStep: PropTypes.func,
};

export default Checkout;

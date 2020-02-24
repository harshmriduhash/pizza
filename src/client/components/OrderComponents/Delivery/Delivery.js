import React, { Component, PropTypes } from 'react';

const styles = {};
import baseStyles from 'styles/order.module.css';
import deliveryStyles from 'styles/delivery.module.css';
Object.assign(styles, baseStyles, deliveryStyles);

class Delivery extends Component {
  constructor(props) {
    super(props);

    // eslint-disable-next-line
    this.phoneRegex = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;
    this.address1 = '';
    this.address2 = '';
    this.zipCode = '';
    this.phoneNumber = '';
    this.instructions = '';
    this.sectionComplete = false;

    this.state = {
      city: null,
      state: null,
    };

    this.elements = {};
    this.onCollapsedClick = this.onCollapsedClick.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onCollapsedClick(event) {
    event.preventDefault();

    this.props.setOrderStep(1);
  }

  onSubmit(event) {
    if (event.preventDefault) {
      event.preventDefault();
    }

    if (!this.validatePhoneNumber()) {
      this.setState({
        error: 'Please enter a valid phone number',
      });

      return false;
    }

    this.toggleSubmit(false);

    fetch(`https://ziptasticapi.com/${this.elements.zipCode.value}`)
      .then((response) => response.json())
      .then((addressJson) => {
        if (addressJson.error) {
          this.elements.submit.disabled = false;
          this.setState({
            error: addressJson.error,
          });
          return;
        }

        fetch('/checkaddress', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address1: this.elements.address1.value,
            address2: this.elements.address2.value,
            zipCode: this.elements.zipCode.value,
            city: this.toTitleCase(addressJson.city),
            state: addressJson.state,
            phoneNumber: this.elements.phoneNumber.value,
            instructions: this.elements.instructions.value,
            pizzaId: this.props.pizza,
            streamerId: this.props.streamerId,
            username: this.props.username,
            size: this.props.size,
            v2: true,
          }),
        })
        .then((response) => response.json())
        .then((json) => {
          if (json.success) {
            this.address1 = this.elements.address1.value;
            this.address2 = this.elements.address2.value;
            this.zipCode = this.elements.zipCode.value;
            this.phoneNumber = this.elements.phoneNumber.value;
            this.instructions = this.elements.instructions.value;
            this.sectionComplete = true;

            this.setState({
              error: null,
            });

            this.props.setOrder(json.order);
          } else {
            this.toggleSubmit(true);
            this.setState({
              error: json.error,
            });
          }
        })
        .catch((error) => {
          this.toggleSubmit(true);
          this.setState({
            error,
          });
        });
      })
      .catch((error) => {
        this.toggleSubmit(true);
        this.setState({
          error,
        });
      });

    return false;
  }

  validatePhoneNumber() {
    const phoneNumber = this.elements.phoneNumber.value;
    return this.phoneRegex.test(phoneNumber);
  }

  toggleSubmit(enabled) {
    if (enabled) {
      this.elements.submit.disabled = false;
      this.elements.submit.value = 'Continue';
    } else {
      this.elements.submit.disabled = true;
      this.elements.submit.value = 'Loading...';
    }
  }

  // http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
  toTitleCase(str) {
    // eslint-disable-next-line arrow-body-style
    return str.replace(/\w\S*/g, (text) => {
      return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
    });
  }

  render() {
    const errorStyle = {
      display: this.state.error ? 'block' : 'none',
    };

    if (!this.props.isActiveSection) {
      const changeLink = this.sectionComplete
        ? <a href="#" onClick={this.onCollapsedClick} className={styles.changeLink}>Change</a>
        : '';

      return (
        <div className={styles.collapsedSection}>
          <i className="fa fa-location-arrow" aria-hidden="true"></i>
          Enter delivery address
          {changeLink}
        </div>
      );
    }

    return (
      <div className={styles.deliveryContent}>
        <div className={styles.contentHeader}>
          <i className="fa fa-location-arrow" aria-hidden="true"></i>
          Enter delivery address
        </div>
        <div className={styles.moreInfo}>
          Enter your address to get your pizza's price and local store contact information.
        </div>
        <p
          ref={(input) => { this.elements.error = input; }}
          className={styles.error}
          style={errorStyle}
        >
          {this.state.error}
        </p>
        <form
          onSubmit={this.onSubmit}
          ref={(form) => { this.elements.form = form; }}
        >
          <input
            type="text"
            ref={(input) => { this.elements.address1 = input; }}
            placeholder="Street address"
            className={styles.formField}
            defaultValue={this.address1}
            autoFocus
            required
          />
          <input
            type="text"
            ref={(input) => { this.elements.address2 = input; }}
            placeholder="Apt # (optional)"
            className={styles.formField}
            defaultValue={this.address2}
          />
          <input
            type="text"
            ref={(input) => { this.elements.zipCode = input; }}
            placeholder="ZIP code"
            className={styles.formField}
            defaultValue={this.zipCode}
            maxLength="5"
            pattern="^\d{5}$"
            required
          />
          <textarea
            type="textarea"
            rows="4"
            ref={(input) => { this.elements.instructions = input; }}
            placeholder="Delivery instructions for driver (e.g., gate code)"
            className={styles['textarea-form-field']}
            defaultValue={this.instructions}
          />
          <input
            type="tel"
            ref={(input) => { this.elements.phoneNumber = input; }}
            placeholder="Phone number"
            className={styles.lastFormField}
            defaultValue={this.phoneNumber}
            required
          />
          <hr className={styles.break} />
          <div className={styles.submitContainer}>
            <input
              type="submit"
              className={styles.submitButton}
              ref={(input) => { this.elements.submit = input; }}
              value="Continue"
            />
          </div>
        </form>
      </div>
    );
  }
}

Delivery.propTypes = {
  isActiveSection: PropTypes.bool,
  streamerId: PropTypes.string,
  username: PropTypes.string,
  pizza: PropTypes.string,
  size: PropTypes.string,
  setOrder: PropTypes.func,
  setOrderStep: PropTypes.func,
};

export default Delivery;

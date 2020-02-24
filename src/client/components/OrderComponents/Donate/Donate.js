import React, { Component, PropTypes } from 'react';

const styles = {};
import baseStyles from 'styles/order.module.css';
import donateStyles from 'styles/donate.module.css';
Object.assign(styles, baseStyles, donateStyles);

class Donate extends Component {
  constructor(props) {
    super(props);

    this.sectionComplete = false;
    this.optionalDonation = null;

    this.elements = {};
    this.onSubmitClick = this.onSubmitClick.bind(this);
    this.onCollapsedClick = this.onCollapsedClick.bind(this);
    this.onDonateButtonClick = this.onDonateButtonClick.bind(this);
  }

  componentWillUpdate(nextProps) {
    const order = nextProps.order;

    if (order) {
      this.smallDonation = Number((order.pizzaCost * 0.15).toFixed(2));
      this.largeDonation = Number((order.pizzaCost * 0.20).toFixed(2));
    }
  }

  onSubmitClick() {
    this.sectionComplete = true;

    if (this.optionalDonation === null) {
      this.props.setOptionalDonation(0.00);
      this.optionalDonation = 0.00;
    } else {
      this.props.setOrderStep(3);
    }
  }

  onCollapsedClick(event) {
    event.preventDefault();

    this.props.setOrderStep(2);
  }

  onDonateButtonClick(event) {
    let amountToDonate = 0.00;

    switch (event.currentTarget.id) {
      case 'donate-discount-btn':
        amountToDonate = this.props.order.pizzaDiscount;
        break;

      case 'donate-five-btn':
        amountToDonate = this.smallDonation;
        break;

      case 'donate-ten-btn':
        amountToDonate = this.largeDonation;
        break;

      default:
        break;
    }

    this.sectionComplete = true;
    this.props.setOptionalDonation(amountToDonate);
    this.optionalDonation = amountToDonate;
  }

  render() {
    if (!this.props.isActiveSection) {
      const changeLink = this.sectionComplete
        ? <a href="#" onClick={this.onCollapsedClick} className={styles.changeLink}>Change</a>
        : '';

      return (
        <div className={styles.collapsedSection}>
          <i className="fa fa-heart" aria-hidden="true"></i>
          Donate to {this.props.streamerId}
          {changeLink}
        </div>
      );
    }

    const order = this.props.order;
    const optionalDonation = this.optionalDonation;
    const defaultDonation = Number(order.pizzaDiscount.toFixed(2));

    return (
      <div className={styles.sectionContent}>
        <div className={styles.contentHeader}>
          <i className="fa fa-heart" aria-hidden="true"></i>
          Donate to {this.props.streamerId}
        </div>
        <div className={styles.moreInfo}>
          You received a ${defaultDonation.toFixed(2)} discount on your pizza.
          Want to donate it to {this.props.streamerId}?
        </div>
        <div className={styles.buttonContainer}>
          <button
            id="donate-discount-btn"
            className={optionalDonation === defaultDonation
              ? styles.activeButton
              : styles.donateButton}
            onClick={this.onDonateButtonClick}
          >
            <div className={styles.discountHeader}>Yes, donate my discount!</div>
            <div className={styles.discountSubheader}>${defaultDonation.toFixed(2)}</div>
          </button>
          <button
            id="donate-none-btn"
            className={optionalDonation === 0
              ? styles.activeButton
              : styles.donateButton}
            onClick={this.onDonateButtonClick}
          >
            <div className={styles.discountHeader}>No donation</div>
          </button>
        </div>

        <hr className={styles.break} />
        <div className={styles.submitContainer}>
          <input
            type="submit"
            className={styles.submitButton}
            ref={(input) => { this.elements.submit = input; }}
            value="Continue"
            onClick={this.onSubmitClick}
          />
        </div>
      </div>
    );
  }
}

Donate.propTypes = {
  order: PropTypes.object,
  streamerId: PropTypes.string,
  isActiveSection: PropTypes.bool,
  setOptionalDonation: PropTypes.func,
  setOrderStep: PropTypes.func,
};

export default Donate;

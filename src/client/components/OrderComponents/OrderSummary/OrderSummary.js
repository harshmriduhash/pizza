import React, { Component, PropTypes } from 'react';
import styles from 'styles/ordersummary.module.css';

// eslint-disable-next-line react/prefer-stateless-function
class OrderSummary extends Component {
  render() {
    const {
      order,
      optionalDonation,
      pizza,
      size,
    } = this.props;

    const sizeMap = {
      s: 'Small (10")',
      m: 'Medium (12")',
      l: 'Large (14")',
    };

    const typeMap = {
      1: 'Pepperoni',
      2: 'Cheese',
      3: 'Hawaiian',
      4: 'Italian Sausage',
      5: 'Mushroom',
    };

    const pizzaDescription = `${sizeMap[size]} Hand Tossed Pizza`;

    if (!order) {
      return (
        <div className={styles.summary}>
          <h1 className={styles.header}>Domino's</h1>
          <h2>My order</h2>
          <div>{typeMap[pizza]}</div>
          <div>{pizzaDescription}</div>
          <h2>Order details</h2>
          <div className={styles.discount}>50% OFF</div>
        </div>
      );
    }

    const {
      pizzaCost,
      pizzaDiscount,
      fee,
      tax,
    } = order;

    const foodCost = pizzaCost
      + fee
      + tax
      - pizzaDiscount;

    const totalCost = foodCost
      + optionalDonation;

    return (
      <div className={styles.summary}>
        <h1 className={styles.header}>Domino's</h1>
        <h2 className={styles.subHeader}>Deliver to</h2>
        <div>{order.address.Street}</div>
        <div>{order.address.City}, {order.address.Region} {order.address.PostalCode}</div>
        <h2 className={styles.subHeader}>My order</h2>
        <div>{order.pizzaDescription}</div>
        <div>{order.pizzaName}</div>
        <h2 className={styles.subHeader}>Order details</h2>
        <div className={styles.receipt}>
          <div className={styles['receipt-labels']}>
            <div>Pizza</div>
            <div className={styles.discount}>50% OFF</div>
            <div>Delivery fee</div>
            <div>Tax</div>
            <hr />
            <div>Food total</div>
            <div>My donation</div>
            <hr />
            <div className={styles.total}>Grand total</div>
          </div>
          <div>
            <div>&nbsp;${order.pizzaCost.toFixed(2)}</div>
            <div className={styles.discount}>-${pizzaDiscount.toFixed(2)}</div>
            <div>&nbsp;${fee.toFixed(2)}</div>
            <div>&nbsp;${tax.toFixed(2)}</div>
            <hr />
            <div>&nbsp;${foodCost.toFixed(2)}</div>
            <div>&nbsp;${optionalDonation.toFixed(2)}</div>
            <hr />
            <div>&nbsp;${totalCost.toFixed(2)}</div>
          </div>
        </div>
        <h2 className={styles.subHeader}>Store details</h2>
        <div>{order.storeAddress}</div>
        <div>{order.storePhoneNumber}</div>
      </div>
    );
  }
}

OrderSummary.propTypes = {
  order: PropTypes.object,
  optionalDonation: PropTypes.number,
  pizza: PropTypes.string,
  size: PropTypes.string,
};

export default OrderSummary;

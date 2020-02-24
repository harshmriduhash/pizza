import React, { Component, PropTypes } from 'react';
import Header from 'components/OrderComponents/Header/Header';
import Footer from 'components/OrderComponents/Footer/Footer';
import Mentions from 'components/OrderComponents/Mentions/Mentions';
import Delivery from 'components/OrderComponents/Delivery/Delivery';
import Donate from 'components/OrderComponents/Donate/Donate';
import OrderSummary from 'components/OrderComponents/OrderSummary/OrderSummary';
import Checkout from 'components/OrderComponents/Checkout/Checkout';
import ConfirmationPage from 'components/OrderComponents/ConfirmationPage/ConfirmationPage';
import styles from 'styles/order.module.css';
import 'font-awesome/css/font-awesome.css';

class Order extends Component {
  constructor(props) {
    super(props);

    const {
      streamerId,
      username,
    } = this.props.params;

    const {
      pizza,
      size,
      testData,
    } = this.props.location.query;

    this.state = {
      orderStep: 1,
      order: null,
      optionalDonation: 0.0,
      streamerId,
      username,
      pizza,
      size,
    };

    if (testData) {
      this.state.orderStep = Number(testData);

      this.state.order = {
        pizzaName: 'Large (14") Hand Tossed Pizza',
        pizzaDescription: 'Hawaiian',
        pizzaDetailedDescription: 'Ham, Pineapple, Robust Inspired Tomato Sauce, Cheese',
        estimatedTime: '20-30',
        pizzaCost: 13.49,
        fee: 2.49,
        tax: 0,
        pizzaDiscount: 1.35,
        address: {
          Street: '550 WILMINGTON AVE',
          StreetNumber: '550',
          StreetName: 'WILMINGTON AVE',
          UnitType: '',
          UnitNumber: '',
          City: 'DAYTON',
          Region: 'OH',
          PostalCode: '45420',
        },
        actualPrice: 1463,
        orderId: '2ce063472d548392abf4f05f917f4cd7',
        phoneNumber: '111-111-1111',
        instructions: '',
        streamerId: 'hungry_pizza_bot',
        username: 'johnhforrest' };
    }

    this.setOptionalDonation = this.setOptionalDonation.bind(this);
    this.setOrder = this.setOrder.bind(this);
    this.setOrderStep = this.setOrderStep.bind(this);
  }

  setOptionalDonation(optionalDonation) {
    this.setState({
      optionalDonation,
      orderStep: 3,
    });
  }

  setOrder(order) {
    this.setState({
      order,
      orderStep: 2,
    });
  }

  setOrderStep(orderStep) {
    // for steps > 1, an order object must be present first
    if (!this.state.order && orderStep > 1) {
      return;
    }

    this.setState({
      orderStep,
    });
  }

  render() {
    let contentBody;
    if (this.state.orderStep === 4) {
      contentBody = (
        <ConfirmationPage
          order={this.state.order}
          optionalDonation={this.state.optionalDonation}
          streamerId={this.state.streamerId}
        />
      );
    } else {
      contentBody = (
        <div className={styles.content}>
          <Delivery
            isActiveSection={this.state.orderStep === 1}
            setOrderStep={this.setOrderStep}
            setOrder={this.setOrder}
            streamerId={this.state.streamerId}
            username={this.state.username}
            pizza={this.state.pizza}
            size={this.state.size}
          />
          <Donate
            isActiveSection={this.state.orderStep === 2}
            setOrderStep={this.setOrderStep}
            setOptionalDonation={this.setOptionalDonation}
            streamerId={this.state.streamerId}
            order={this.state.order}
          />
          <Checkout
            isActiveSection={this.state.orderStep === 3}
            setOrderStep={this.setOrderStep}
            order={this.state.order}
            optionalDonation={this.state.optionalDonation}
          />
        </div>
      );
    }

    return (
      <div>
        <Header />
        <Mentions />
        <div className={styles.body}>
          {contentBody}
          <div className={styles.summary}>
            <OrderSummary
              order={this.state.order}
              optionalDonation={this.state.optionalDonation}
              pizza={this.state.pizza}
              size={this.state.size}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

Order.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
};

export default Order;

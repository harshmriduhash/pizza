import defines from '../../config/env';
import stripe from 'stripe';
const stripeHelper = stripe(defines.__STRIPE_KEY__);
import pizzapi from 'dominos';
import fetch from 'node-fetch';
import { getAdjustedDollarAmount } from './helpers';
import { getCachedActualOrder, getCachedOrder } from './cachedOrders';
import { botUrl } from './constants';
const attemptRealPayment = false;

function trackPizza(phoneNumber, username) {
  pizzapi.Track.byPhone(
    phoneNumber,
    (pizzaData) => {
      if (pizzaData.orders && pizzaData.orders.OrderStatus) {
        const orderStatus = pizzaData.orders.OrderStatus;
        const url = `https://www.dominos.com/en/pages/tracker/#/track/order/${orderStatus.OrderKey}/StoreID/${orderStatus.StoreID}/`;

        fetch(`${botUrl}/receivetracking`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            trackingUrl: url,
          }),
        })
        .then((response) => response.json())
        .then((json) => {
          if (!json.success) {
            console.log(json.error);
          }
        })
        .catch((error) => {
          console.log(error);
        });
      } else {
        console.log('there was an error generating tracking information');
        console.log(JSON.stringify(pizzaData));
      }
    }
  );
}

function orderFromDominos(orderId, phoneNumber, instructions) {
  return new Promise((resolve, reject) => {
    const order = getCachedOrder(orderId);
    const actualOrder = getCachedActualOrder(orderId);
    actualOrder.Phone = phoneNumber.replace(/\D/g, ''); // strip out any non-numerical characters;
    actualOrder.Address.DeliveryInstructions = instructions;

    const cardInfo = new actualOrder.PaymentObject();
    cardInfo.Amount = actualOrder.Amounts.Customer;
    cardInfo.Number = '';
    cardInfo.CardType = actualOrder.validateCC(cardInfo.Number);
    cardInfo.Expiration = '';
    cardInfo.SecurityCode = '';
    cardInfo.PostalCode = '';

    actualOrder.Payments.push(cardInfo);
    actualOrder.place((orderResult) => {
      if (attemptRealPayment) {
        if (!orderResult.success || orderResult.result.Status !== 1) {
          console.log(JSON.stringify(orderResult));
          reject(orderResult);
        } else {
          resolve();
        }
      } else {
        resolve();
      }

      setTimeout(trackPizza, 60000, actualOrder.Phone, order.username);
    });
  });
}

function orderPizza(orderId, body, customerId, clientIp) {
  const {
    optionalDonation,
  } = body;

  const order = getCachedOrder(orderId);
  const adjustedDonation = getAdjustedDollarAmount(optionalDonation);

  const phoneNumber = order.phoneNumber;
  const instructions = order.instructions;

  // eslint-disable-next-line
  order.optionalDonation = adjustedDonation ? Number(optionalDonation).toFixed(2) : 0;

  return new Promise((resolve, reject) => {
    const adjustedPrice = order.actualPrice + adjustedDonation;
    if (adjustedPrice < order.actualPrice) {
      reject('Invalid amount');
      return;
    }

    stripeHelper.charges.create({
      amount: adjustedPrice | 0, // converting to integer
      currency: 'usd',
      customer: customerId,
      description: `${order.pizzaName} ${order.pizzaDescription}`,
      statement_descriptor: 'Hungry Pizza Bot',
      metadata: {
        client_ip: clientIp,
        streamer: order.streamerId,
        optionalDonation: adjustedDonation,
        instructions,
        phone: phoneNumber,
        address_street: order.address.Street,
        address_city: order.address.City,
        address_state: order.address.Region,
        address_postal_code: order.address.PostalCode,
        address_country: 'US',
        twitchUsername: order.username,
      },
    }).then(() => {
      fetch(`${botUrl}/receivepayment`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: order.username,
          optionalDonation: order.optionalDonation,
        }),
      })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          orderFromDominos(orderId, phoneNumber, instructions)
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          reject(json.error);
        }
      })
      .catch((error) => {
        reject(error);
      });
    });
  });
}

module.exports = {
  orderPizza,
};

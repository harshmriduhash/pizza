import Models from '../../db/sequelize/models';
const Customer = Models.Customer;

// utility functions
import { trackEvent } from '../helpers';
import { checkAddress } from '../checkAddress';

import { orderPizza } from '../checkout';
import {
  addCachedOrder,
  getCachedOrder,
  addCachedActualOrder,
} from '../cachedOrders';

import defines from '../../../config/env';
import stripe from 'stripe';
const stripeHelper = stripe(defines.__STRIPE_KEY__);

export default (app) => {
  app.get('order/:streamerId/:username', (req, res, next) => {
    trackEvent(req, 'Loaded the website', req.params.username, {
      streamerId: req.params.streamerId,
    });

    next();
  });

  app.post('/checkaddress', (req, res) => {
    const result = {
      success: false,
    };

    checkAddress(req.body)
      .then((orderInfo) => {
        addCachedActualOrder(orderInfo.actualOrder, orderInfo.order.orderId);
        addCachedOrder(orderInfo.order, orderInfo.order.orderId);

        trackEvent(req, 'Checked delivery address', req.body.username, {
          streamerId: req.body.streamerId,
        }, {
          location: {
            city: orderInfo.order.address.City,
            region: orderInfo.order.address.Region,
          },
        });

        result.order = orderInfo.order;
        result.success = true;
        result.orderId = orderInfo.order.orderId;
        res.json(result);
      })
      .catch((err) => {
        trackEvent(req, 'Error checking address', req.body.username, {
          streamerId: req.body.streamerId,
          error: err.error,
        }, {
          location: {
            city: err.address ? err.address.City : undefined,
            region: err.address ? err.address.Region : undefined,
          },
        });

        result.error = err.error;
        console.log(result.error);
        if (err.address) {
          // logging PII, need to be careful
          console.log(JSON.stringify(err.address));
        }
        res.json(result);
      });
  });

  app.post('/checkout', (req, res) => {
    const result = {
      success: false,
    };

    const {
      token,
      orderId,
    } = req.body;

    if (!token || !orderId) {
      result.error = 'Invalid POST arguments';
      console.log(result.error);
      res.json(result);
      return;
    }

    const order = getCachedOrder(orderId);
    if (!order) {
      result.error = 'Invalid orderId';
      console.log(result.error);
      res.json(result);
      return;
    }

    Customer.findCreateFind({
      where: {
        twitch: order.username,
      },
      defaults: {
        twitch: order.username,
      },
    }).spread((dbCustomer, created) => {
      if (!created && dbCustomer.get('stripe_customer_id')) {
        orderPizza(orderId, req.body, dbCustomer.get('stripe_customer_id'), token.client_ip)
          .then(() => {
            trackEvent(req, 'Made a payment', order.username, {
              streamerId: order.streamerId,
            });

            result.success = true;
            res.json(result);
          });
      } else {
        stripeHelper.customers.create({
          source: token,
          metadata: {
            twitch: order.username,
          },
        }).then((newCustomer) => {
          dbCustomer.update({
            stripe_customer_id: newCustomer.id,
          }).then(() => {
            orderPizza(orderId, req.body, newCustomer.id, token.client_ip)
              .then(() => {
                trackEvent(req, 'Made a payment', order.username, {
                  streamerId: order.streamerId,
                });

                result.success = true;
                res.json(result);
              });
          });
        });
      }
    }).catch((error) => {
      trackEvent(req, 'Error making a payment', order.username, {
        streamerId: order.streamerId,
      });

      console.log(error);
      result.error = error;
      res.json(result);
    });
  });
};

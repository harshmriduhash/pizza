import pizzapi from 'dominos';
import crypto from 'crypto';

// eslint-disable-next-line
import { sizeMap, pizzaMap } from '../lib/utilities';
import { getAdjustedDollarAmount } from './helpers';
const hardCodedDiscount = 0.50;

function findNearbyStores(address) {
  return new Promise((resolve, reject) => {
    pizzapi.Util.findNearbyStores(
      address,
      'Delivery',
      (storeData) => {
        if (storeData.result && storeData.result.Stores && storeData.result.Stores.length) {
          let storeInfo;
          for (let i = 0; i < storeData.result.Stores.length; i++) {
            if (storeData.result.Stores[i].ServiceIsOpen.Delivery) {
              storeInfo = storeData.result.Stores[i];
              break;
            }
          }
          if (storeInfo) {
            resolve({
              storeInfo,
              address: storeData.result.Address,
            });
          } else {
            reject({
              error: 'There are no stores open in your area for delivery at this time',
              address: storeData.result.Address,
            });
          }
        } else {
          reject({ error: 'There was an error looking up your address. Please try again.' });
        }
      });
  });
}

function createDominosOrder(storeAddressInfo, item, pizzaId) {
  return new Promise((resolve, reject) => {
    const cust = new pizzapi.Customer({
      firstName: 'Hungry',
      lastName: 'Bot',
      address: storeAddressInfo.address,
      email: 'john@septur.com',
    });

    const actualOrder = new pizzapi.Order({
      customer: cust,
      storeID: `${storeAddressInfo.storeInfo.StoreID}`,
      deliveryMethod: 'Delivery',
    });

    actualOrder.storeAddress = storeAddressInfo.storeInfo.AddressDescription;
    actualOrder.storePhoneNumber = storeAddressInfo.storeInfo.Phone;
    actualOrder.addItem(item);
    actualOrder.price((orderResult) => {
      if (!orderResult.success || orderResult.result.Status !== 1) {
        console.log(orderResult, orderResult.result);
        reject({
          error: 'Sorry, Domino\'s does not deliver to your area at this time or there was a typo in your address. ' +
            'Try fixing your address or come back later when we\'ve added new delivery options',
          address: storeAddressInfo.address,
        });
        return;
      }

      // creating a unique identifier to represent the order
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          reject(err);
          return;
        }

        const pizza = orderResult.result.Order.Products[0];
        const amounts = orderResult.result.Order.AmountsBreakdown;
        const discountedPrice = Number(
          (getAdjustedDollarAmount(amounts.FoodAndBeverage) * hardCodedDiscount)
            .toFixed(0));

        const actualPrice =
          discountedPrice
          + getAdjustedDollarAmount(amounts.DeliveryFee)
          + getAdjustedDollarAmount(amounts.Tax);
        const pizzaDiscount = (Number(amounts.FoodAndBeverage) *
          (1 - hardCodedDiscount)).toFixed(2);
        const orderId = buf.toString('hex');

        const order = {
          pizzaName: pizza.Name,
          pizzaDescription: pizzaMap[pizzaId].name,
          pizzaDetailedDescription: pizza.descriptions[0].value,
          estimatedTime: orderResult.result.Order.EstimatedWaitMinutes,
          pizzaCost: Number(amounts.FoodAndBeverage),
          fee: Number(amounts.DeliveryFee),
          tax: Number(amounts.Tax),
          pizzaDiscount: Number(pizzaDiscount),
          address: storeAddressInfo.address,
          actualPrice,
          orderId,
          storeAddress: storeAddressInfo.storeInfo.AddressDescription,
          storePhoneNumber: storeAddressInfo.storeInfo.Phone,
        };

        resolve({
          actualOrder,
          order,
        });
      });
    });
  });
}

function checkAddress(body) {
  const {
    address1,
    address2,
    zipCode,
    city,
    state,
    streamerId,
    username,
    pizzaId,
    size,
    phoneNumber,
    instructions,
  } = body;

  return new Promise((resolve, reject) => {
    if (!address1 || !zipCode) {
      reject('Invalid POST data');
      return;
    }

    const addressLine1 = address2 ? `${address1} ${address2}` : address1;
    findNearbyStores(`${addressLine1}, ${city}, ${state}, ${zipCode}`)
      .then((storeAddressInfo) => {
        const item = new pizzapi.Item({
          code: sizeMap[size],
          quantity: 1,
          options: pizzaMap[pizzaId].toppings,
        });

        createDominosOrder(storeAddressInfo, item, pizzaId)
          .then((orderInfo) => {
            Object.assign(orderInfo.order, {
              phoneNumber,
              instructions,
              streamerId,
              username,
            });
            resolve(orderInfo);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = {
  checkAddress,
};

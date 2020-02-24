const cachedOrders = {};
const cachedActualOrders = {};

module.exports = {
  addCachedOrder: (order, orderId) => {
    cachedOrders[orderId] = order;
  },

  getCachedOrder: (orderId) =>
    cachedOrders[orderId],

  addCachedActualOrder: (actualOrder, orderId) => {
    cachedActualOrders[orderId] = actualOrder;
  },

  getCachedActualOrder: (orderId) =>
    cachedActualOrders[orderId],
};

const sizeMap = {
  s: '10SCREEN',
  m: '12SCREEN',
  l: '14SCREEN',
};

const pizzaMap = {
  1: {
    name: 'Pepperoni',
    toppings: ['P'], // pepperoni
  },
  2: {
    name: 'Cheese',
    toppings: [], // none
  },
  3: {
    name: 'Hawaiian',
    toppings: ['H', 'N'], // ham + pineapple
  },
  4: {
    name: 'Italian Sausage',
    toppings: ['S'], // sausage
  },
  5: {
    name: 'Mushroom',
    toppings: ['M'], // mushroom
  },
};

module.exports = {
  sizeMap,
  pizzaMap,
};

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER, // TODO: this should be a guid and not an INT
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    twitch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
  }, {
    timestamps: false,
  });

  return Customer;
};

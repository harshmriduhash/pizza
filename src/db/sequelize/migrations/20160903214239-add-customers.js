module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface.createTable(
      'Customers', {
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
          allowNull: false,
        },
      }
    ).then(() =>
      queryInterface.addIndex(
        'Users',
        [DataTypes.fn('lower', DataTypes.col('twitch'))],
        {
          indexName: 'customers_twitch',
          indicesType: 'unique',
        }
      )
    );
  },

  down(queryInterface) {
    return queryInterface.dropTable('Customers');
  },
};

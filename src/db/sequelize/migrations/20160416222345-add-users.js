module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface.createTable(
      'Users', {
        id: {
          type: DataTypes.INTEGER, // TODO: this should be a guid and not an INT
          primaryKey: true,
          autoIncrement: true,
        },
        email: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        paypal: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        twitch: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        is_bot_moderator: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        is_bot_present: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        advertisements_enabled: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        advertisement: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        advertisement_cadence: {
          type: DataTypes.INTEGER,
          defaultValue: -1,
        },
        announce_orders: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        order_announcement: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        order_announcement_with_donation: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        bot_name: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
        bot_password: {
          type: DataTypes.STRING,
          defaultValue: '',
        },
      }
    ).then(() =>
      queryInterface.addIndex(
        'Users',
        [DataTypes.fn('lower', DataTypes.col('twitch'))],
        {
          indexName: 'users_twitch',
          indicesType: 'unique',
        }
      )
    );
  },

  down(queryInterface) {
    return queryInterface.dropTable('Users');
  },
};

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
      type: DataTypes.STRING, // TODO: should probably encrypt this when we collect
      defaultValue: '',
    },
  }, {
    timestamps: false,

    classMethods: {
      associate(models) {
        User.hasMany(models.Token, {
          foreignKey: 'userId',
        });
      },
    },

    instanceMethods: {
      toJSON() {
        return {
          id: this.id,
          // email: this.email, TODO: masking this for security reasons since we have an endpoint that displays this
          twitch: this.twitch,
          botSettings: {
            isModerator: this.is_bot_moderator,
            isBotPresent: this.is_bot_present,
            advertisementsEnabled: this.advertisements_enabled,
            cadence: this.advertisement_cadence,
            announceOrders: this.announce_orders,

            // orderAnnouncement: this.order_announcement,
            // orderAnnouncementWithDonation: this.order_announcement_with_donation,
            // botName: this.bot_name,
            // botPassword: this.bot_password,
          },
        };
      },
    },
  });

  return User;
};

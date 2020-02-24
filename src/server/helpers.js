import defines from '../../config/env';
import Analytics from 'analytics-node';

// eslint-disable-next-line new-cap
const analytics = Analytics(defines.__SEGMENT_WRITE_KEY__);

module.exports = {
  getAdjustedDollarAmount: (rawAmount) => {
    if (typeof rawAmount === 'number') {
      return Number((rawAmount * 100).toFixed(0));
    }

    const amount = Number(rawAmount.replace('.', ''));
    if (isNaN(amount)) {
      return 0;
    }

    if (amount < 0) {
      return 0;
    }

    return amount;
  },

  trackEvent: (req, event, userId, properties, optionalContext) => {
    const context = {
      ip: req.ip ? req.ip.split(':')[0] : '', // removing the port from proxied ip address
      userAgent: req.headers['user-agent'] || '',
      locale: req.headers['accept-language'] ? req.headers['accept-language'].split(',')[0] : '',
    };

    if (optionalContext) {
      Object.assign(context, optionalContext);
    }

    analytics.track({
      userId,
      event,
      properties,
      context,
    });
  },
};

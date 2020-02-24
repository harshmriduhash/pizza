import { logger } from './logger';
import {
  receivePizzaPayment,
  receiveTrackingInformation,
  joinChannel,
  leaveChannel,
  toggleAdvertisements,
  detectModeratorStatus,
  updateSettings,
  advertiseOnce,
} from './johnbot';

export default (app) => {
  app.post('/receivepayment', (req, res) => {
    const result = {
      success: false,
    };

    const {
      username,
      optionalDonation,
    } = req.body;

    if (!username) {
      result.error = 'Invalid POST arguments';
      logger.error(result.error);
      res.json(result);
      return;
    }

    receivePizzaPayment(username, optionalDonation)
      .then(() => {
        result.success = true;
        res.json(result);
      })
      .catch((error) => {
        result.error = error;
        logger.error('There was an error receiving the pizza payment', result.error);
        res.json(result);
      });
  });

  app.post('/receivetracking', (req, res) => {
    const result = {
      success: false,
    };

    const {
      username,
      trackingUrl,
    } = req.body;

    if (!username || !trackingUrl) {
      result.error = 'Invalid POST arguments';
      logger.error(result.error);
      res.json(result);
      return;
    }

    receiveTrackingInformation(username, trackingUrl)
      .then(() => {
        result.success = true;
        res.json(result);
      })
      .catch((error) => {
        result.error = error;
        logger.error(result.error);
        res.json(result);
      });
  });

  app.post('/joinChannel', (req, res) => {
    const {
      username,
    } = req.body;

    if (!username) {
      res.status(409).json({
        message: 'no username present',
      });

      return;
    }

    joinChannel(username)
      .then(() => {
        res.status(200).json();
      })
      .catch((error) => {
        res.status(409).json({ message: error });
      });
  });

  app.post('/leaveChannel', (req, res) => {
    const {
      username,
    } = req.body;

    if (!username) {
      res.status(409).json({
        message: 'no username present',
      });

      return;
    }

    leaveChannel(username)
      .then(() => {
        res.status(200).json();
      })
      .catch((error) => {
        res.status(409).json({ message: error });
      });
  });

  app.post('/toggleAdvertisements', (req, res) => {
    const {
      username,
      adsEnabled,
    } = req.body;

    if (!username) {
      res.status(409).json({
        message: 'no username present',
      });

      return;
    }

    toggleAdvertisements(username, adsEnabled)
      .then(() => {
        res.status(200).json();
      })
      .catch((err) => {
        logger.error(err);
        res.status(409).json(err);
      });
  });

  app.post('/detectModeratorStatus', (req, res) => {
    const {
      username,
    } = req.body;

    if (!username) {
      res.status(409).json({
        message: 'no username present',
      });

      return;
    }

    detectModeratorStatus(username)
      .then(() => {
        res.status(200).json();
      })
      .catch((error) => {
        res.status(409).json({ message: error });
      });
  });

  app.post('/updateSettings', (req, res) => {
    const {
      username,
      cadence,
      paypal,
    } = req.body;

    if (!username) {
      res.status(409).json({
        message: 'no username present',
      });

      return;
    }

    updateSettings(username, cadence, paypal)
      .then(() => {
        res.status(200).json();
      })
      .catch((err) => {
        logger.error(err);
        res.status(409).json(err);
      });
  });

  app.post('/advertise', (req, res) => {
    const {
      username,
    } = req.body;

    if (!username) {
      res.status(409).json({
        message: 'no username present',
      });

      return;
    }

    advertiseOnce(username);
    res.status(200).json();
  });
};

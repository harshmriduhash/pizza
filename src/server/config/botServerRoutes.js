import fetch from 'node-fetch';
import { botUrl } from '../constants';

function makeBotServerRequest(req, res, api, data, successMessage, errorMessage) {
  if (req.user) {
    fetch(`${botUrl}/${api}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then((response) => {
      if (response.status === 200) {
        res.status(200).json({
          message: successMessage,
        });
      } else {
        res.status(409).json(errorMessage);
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(409).json(error);
    });
  } else {
    console.log('no user present');
    res.status(409).json({ error: 'no user present' });
  }
}

export default (app) => {
  app.post('/updateSettings', (req, res) =>
    makeBotServerRequest(
      req,
      res,
      'updateSettings',
      {
        username: req.user.twitch,
        cadence: req.body.cadence,
        paypal: req.body.paypal,
      },
      'Your settings have been updated.',
      'There was an error updating your settings.')
    );

  app.post('/toggleAdvertisements', (req, res) =>
    makeBotServerRequest(
      req,
      res,
      'toggleAdvertisements',
      {
        username: req.user.twitch,
        adsEnabled: req.body.adsEnabled,
      },
      'Your advertising state has been changed.',
      'There was an error changing your advertising state.')
    );

  app.post('/detectModeratorStatus', (req, res) =>
    makeBotServerRequest(
      req,
      res,
      'detectModeratorStatus',
      {
        username: req.user.twitch,
      },
      'Your moderator status has been detected.',
      'There was an error detecting your moderator status')
    );

  app.post('/joinChannel', (req, res) =>
    makeBotServerRequest(
      req,
      res,
      'joinChannel',
      {
        username: req.user.twitch,
      },
      'Hungrybot has joined your channel.',
      'There was an error joining your channel.')
    );

  app.post('/leaveChannel', (req, res) =>
    makeBotServerRequest(
      req,
      res,
      'leaveChannel',
      {
        username: req.user.twitch,
      },
      'Hungrybot has left your channel.',
      'There was an error leaving your channel.')
    );

  app.post('/advertise', (req, res) =>
    makeBotServerRequest(
      req,
      res,
      'advertise',
      {
        username: req.user.twitch,
      },
      'Hungrybot has advertised in your channel.',
      'There was an error advertising in your channel.')
    );
};

import { Strategy } from 'passport-twitchtv/lib/passport-twitchtv/index';
import defines from '../../../../config/env';
import { passport as dbPassport } from '../../../db';

const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isIntegration = environment === 'integration';

let callbackURL;
if (isProduction) {
  callbackURL = 'https://app.hungrybot.co/auth/twitchtv/callback';
} else if (isIntegration) {
  callbackURL = 'https://int.hungrybot.co/auth/twitchtv/callback';
} else {
  callbackURL = 'http://localhost:8080/auth/twitchtv/callback';
}

export default (passport) => {
  // Use the TwitchtvStrategy within Passport.
  //   Strategies in passport require a `verify` function, which accept
  //   credentials (in this case, a accessToken, refreshToken, Twitch.tv profile, and scope required),
  //   and invoke a callback with a user object.
  passport.use(
    new Strategy({
      clientID: defines.__TWITCHTV_CLIENT_ID__,
      clientSecret: defines.__TWITCHTV_CLIENT_SECRET__,
      callbackURL,
      scope: 'user_read',
    }, dbPassport.twitch));
};

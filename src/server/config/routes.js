/**
 * Routes for express app
 */
import passport from 'passport';
import { controllers } from '../../db';
const usersController = controllers.users;

export default (app) => {
  app.get('/logout', usersController.logout);
  app.get('/pizzabot/streamer/status', usersController.getStreamerStatus);

  // GET /login
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Twitch.tv authentication will involve
  //   redirecting the user to Twitch.tv.  After authorization, Twitch.tv will
  //   redirect the user back to this application at /auth/twitchtv/callback
  app.get('/login',
    passport.authenticate('twitchtv', {
      scope: ['user_read'],
    })
  );

  // GET /auth/twitchtv/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  // at this point the user gets stored in a session state (express-session)
  // the session id is saved in a cookie-parser
  app.get('/auth/twitchtv/callback',
    passport.authenticate('twitchtv', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
    })
  );
};

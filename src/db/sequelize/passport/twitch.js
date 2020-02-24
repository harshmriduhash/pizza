import Models from '../models';

const sequelize = Models.sequelize;
const User = Models.User;

function createUserWithToken(profile, accessToken, done) {
  return sequelize.transaction((transaction) =>
    User.create({
      email: profile.email,
      twitch: profile.username,
    }, { transaction }).then((user) =>
      user.createToken({
        kind: 'twitch',
        accessToken,
      }, { transaction }).then(() =>
        done(null, user)
      )
    )
  );
}

export default (req, accessToken, refreshToken, profile, done) =>
  User.findOne({
    where: { twitch: profile.username },
  }).then((existingUser) => {
    if (existingUser) {
      if (existingUser.get('email')) {
        return done(null, existingUser);
      }

      // in some cases, the user may have been created without an email address so we add one if it hasn't been found
      return existingUser.update({
        email: profile.email,
      })
      .then(() =>
        done(null, existingUser)
      );
    }

    return createUserWithToken(profile, accessToken, done);
  }).catch((err) => {
    console.log(err);
    return done(null, false, { message: 'Something went wrong trying to authenticate' });
  });

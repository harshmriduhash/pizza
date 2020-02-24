import Models from '../models';
const User = Models.User;

export function logout(req, res) {
  req.logout();
  res.redirect('/logout');
}

export function getStreamerStatus(req, res) {
  User.findAll()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(409).json(error);
    });
}

export default {
  logout,
  getStreamerStatus,
};

import * as types from 'types';
import { combineReducers } from 'redux';

const message = (
  state = '',
  action
) => {
  switch (action.type) {
    case types.LOGOUT_USER:
      return '';
    default:
      return state;
  }
};

const isWaiting = (
  state = false,
  action
) => {
  switch (action.type) {
    case types.LOGOUT_USER:
    case types.DETECT_MODERATOR_STATUS:
    case types.UPDATE_SETTINGS:
    case types.TOGGLE_ANNOUNCEMENTS:
    case types.JOIN_CHANNEL:
    case types.LEAVE_CHANNEL:
      return true;
    case types.LOGOUT_USER_SUCCESS:
    case types.LOGOUT_USER_ERROR:
    case types.DETECT_MODERATOR_STATUS_SUCCESS:
    case types.DETECT_MODERATOR_STATUS_ERROR:
    case types.UPDATE_SETTINGS_SUCCESS:
    case types.UPDATE_SETTINGS_ERROR:
    case types.TOGGLE_ANNOUNCEMENTS_SUCCESS:
    case types.TOGGLE_ANNOUNCEMENTS_ERROR:
    case types.JOIN_CHANNEL_SUCCESS:
    case types.JOIN_CHANNEL_ERROR:
    case types.LEAVE_CHANNEL_SUCCESS:
    case types.LEAVE_CHANNEL_ERROR:
    case types.ADVERTISE_ONCE_STATUS_SUCCESS:
    case types.ADVERTISE_ONCE_STATUS_ERROR:
      return false;
    default:
      return state;
  }
};

const authenticated = (
  state = false,
  action
) => {
  switch (action.type) {
    case types.LOGOUT_USER_ERROR:
      return true;
    case types.LOGOUT_USER_SUCCESS:
      return false;
    default:
      return state;
  }
};

const email = (
  state = '',
  action
) => {
  switch (action.type) {
    case types.LOGOUT_USER_ERROR:
      return action.email;
    case types.LOGOUT_USER_SUCCESS:
      return '';
    default:
      return state;
  }
};

const twitch = (
  state = '',
  action
) => {
  switch (action.type) {
    case types.LOGOUT_USER_ERROR:
      return action.twitch;
    case types.LOGOUT_USER_SUCCESS:
      return '';
    default:
      return state;
  }
};

const isModerator = (
  state = false,
  action
) => {
  switch (action.type) {
    case types.DETECT_MODERATOR_STATUS_SUCCESS:
      return true;
    default:
      return state;
  }
};

const isBotPresent = (
  state = false,
  action
) => {
  switch (action.type) {
    case types.JOIN_CHANNEL_SUCCESS:
    case types.LEAVE_CHANNEL_ERROR:
      return true;
    case types.JOIN_CHANNEL_ERROR:
    case types.LEAVE_CHANNEL_SUCCESS:
      return false;
    default:
      return state;
  }
};

const cadence = (
  state = -1,
  action
) => {
  switch (action.type) {
    case types.UPDATE_SETTINGS_SUCCESS:
      return action.settings.cadence;
    default:
      return state;
  }
};

const paypal = (
  state = -1,
  action
) => {
  switch (action.type) {
    case types.UPDATE_SETTINGS_SUCCESS:
      return action.settings.paypal;
    default:
      return state;
  }
};

const adsEnabled = (
  state = false,
  action
) => {
  switch (action.type) {
    case types.TOGGLE_ANNOUNCEMENTS_SUCCESS:
      return action.adsEnabled;
    case types.TOGGLE_ANNOUNCEMENTS_ERROR:
      return !action.adsEnabled;
    case types.TOGGLE_ANNOUNCEMENTS:
    default:
      return state;
  }
};

const userReducer = combineReducers({
  isWaiting,
  authenticated,
  message,
  email,
  twitch,
  isModerator,
  isBotPresent,
  adsEnabled,
  cadence,
  paypal,
});

export default userReducer;

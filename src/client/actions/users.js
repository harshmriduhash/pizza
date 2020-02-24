import request from 'axios';
import { push } from 'react-router-redux';

import * as types from 'types';

// const getMessage = res => res.response && res.response.data && res.response.data.message;
/*
 * Utility function to make AJAX requests using isomorphic fetch.
 * @param Object Data you wish to pass to the server
 * @param String HTTP method, e.g. post, get, put, delete
 * @param String endpoint
 * @return Promise
 */
// TODO: what makes this special? why not just use fetch
function makeUserRequest(method, data, api) {
  return request[method](api, data);
}

// update settings actions
export function beginUpdateSettings() {
  return { type: types.UPDATE_SETTINGS };
}

export function updateSettingsSuccess(settings) {
  return { type: types.UPDATE_SETTINGS_SUCCESS, settings };
}

export function updateSettingsError() {
  return { type: types.UPDATE_SETTINGS_ERROR };
}

export function updateSettings(settings, shouldNavigate) {
  return dispatch => {
    dispatch(beginUpdateSettings());

    makeUserRequest('post', settings, '/updateSettings')
      .then(response => {
        if (response.status === 200) {
          dispatch(updateSettingsSuccess(settings));

          if (shouldNavigate) {
            dispatch(push('/dashboard?updated=1'));
          }
        } else {
          console.log('there was an error updating moderator status');
          dispatch(updateSettingsError());
        }
      })
      .catch(err => {
        console.log(err);
        dispatch(updateSettingsError());
      });
  };
}

// toggle announcements actions
export function beginToggleAnnouncements() {
  return { type: types.TOGGLE_ANNOUNCEMENTS };
}

export function toggleAnnouncementsSuccess(adsEnabled) {
  return { type: types.TOGGLE_ANNOUNCEMENTS_SUCCESS, adsEnabled };
}

export function toggleAnnounecmentsError(adsEnabled) {
  return { type: types.TOGGLE_ANNOUNCEMENTS_ERROR, adsEnabled };
}

export function toggleAdvertisements(adsEnabled) {
  return dispatch => {
    dispatch(beginToggleAnnouncements());

    makeUserRequest('post', { adsEnabled }, '/toggleAdvertisements')
      .then(response => {
        if (response.status === 200) {
          dispatch(toggleAnnouncementsSuccess(adsEnabled));
        } else {
          console.log('there was an error toggling advertisements');
          dispatch(toggleAnnounecmentsError(adsEnabled));
        }
      })
      .catch(err => {
        console.log(err);
        dispatch(toggleAnnounecmentsError(adsEnabled));
      });
  };
}

// join channel actions
// TODO: this is a little tricky because if there was an error joining the channel
// we won't know from the immediate response from the bot server.
// for now we'll just deal with the redux state being mismatched
export function beginJoinChannel() {
  return { type: types.JOIN_CHANNEL };
}

export function joinChannelSuccess() {
  return { type: types.JOIN_CHANNEL_SUCCESS };
}

export function joinChannelError() {
  return { type: types.JOIN_CHANNEL_ERROR };
}

export function joinChannel() {
  return dispatch => {
    dispatch(beginJoinChannel());

    makeUserRequest('post', {}, '/joinChannel')
      .then(response => {
        if (response.status === 200) {
          dispatch(joinChannelSuccess());
        } else {
          console.log('there was an error updating moderator status');
          dispatch(joinChannelError());
        }
      })
      .catch(err => {
        console.log(err);
        dispatch(joinChannelError());
      });
  };
}

// leave channel actions
// TODO: this is a little tricky because if there was an error joining the channel
// we won't know from the immediate response from the bot server.
// for now we'll just deal with the redux state being mismatched
export function beginLeaveChannel() {
  return { type: types.LEAVE_CHANNEL };
}

export function leaveChannelSuccess() {
  return { type: types.LEAVE_CHANNEL_SUCCESS };
}

export function leaveChannelError() {
  return { type: types.LEAVE_CHANNEL_ERROR };
}

export function leaveChannel() {
  return dispatch => {
    dispatch(beginLeaveChannel());

    makeUserRequest('post', {}, '/leaveChannel')
      .then(response => {
        if (response.status === 200) {
          dispatch(leaveChannelSuccess());
        } else {
          console.log('there was an error updating moderator status');
          dispatch(leaveChannelError());
        }
      })
      .catch(err => {
        console.log(err);
        dispatch(leaveChannelError());
      });
  };
}

// moderator status actions
export function beginDetectModeratorStatus() {
  return { type: types.DETECT_MODERATOR_STATUS };
}

export function detectModeratorStatusSuccess() {
  return { type: types.DETECT_MODERATOR_STATUS_SUCCESS };
}

export function detectModeratorStatusError() {
  return { type: types.DETECT_MODERATOR_STATUS_ERROR };
}

export function detectModeratorStatus() {
  return dispatch => {
    dispatch(beginDetectModeratorStatus());

    makeUserRequest('post', {}, '/detectModeratorStatus')
      .then(response => {
        if (response.status === 200) {
          dispatch(detectModeratorStatusSuccess());
        } else {
          dispatch(detectModeratorStatusError());
        }
      })
      .catch(err => {
        console.log(err);
        dispatch(detectModeratorStatusError());
      });
  };
}

// one time advertisement
export function beginAdvertiseOnce() {
  return { type: types.ADVERTISE_ONCE };
}

export function advertiseOnceSuccess() {
  return { type: types.ADVERTISE_ONCE_STATUS_SUCCESS };
}

export function advertiseOnceError() {
  return { type: types.ADVERTISE_ONCE_STATUS_ERROR };
}

export function advertiseOnce() {
  return dispatch => {
    dispatch(beginAdvertiseOnce());

    makeUserRequest('post', {}, '/advertise')
      .then(response => {
        if (response.status === 200) {
          dispatch(advertiseOnceSuccess());
        } else {
          dispatch(advertiseOnceError());
        }
      })
      .catch(err => {
        console.log(err);
        dispatch(advertiseOnceError());
      });
  };
}

// Log Out Action Creators
export function beginLogout() {
  return { type: types.LOGOUT_USER };
}

export function logoutSuccess() {
  return { type: types.LOGOUT_USER_SUCCESS };
}

export function logoutError() {
  return { type: types.LOGOUT_USER_ERROR };
}

export function logOut() {
  return dispatch => {
    dispatch(beginLogout());

    return makeUserRequest('post', null, '/logout')
      .then(response => {
        if (response.status === 200) {
          dispatch(logoutSuccess());
        } else {
          dispatch(logoutError());
        }
      });
  };
}

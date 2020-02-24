import values from 'object.values';
import tmi from 'tmi.js';
import { logger, createChannelLogger } from './logger';
import * as helpers from './helpers';
import {
  adminList,
  adminCommands,
  chatCommands,
  whisperCommands,
  conversation,
  siteUrl,
  options,
} from './constants';
import defines from '../../config/env';
import Analytics from 'analytics-node';
import Models from '../db/sequelize/models';
const User = Models.User;

// eslint-disable-next-line new-cap
const analytics = Analytics(defines.__SEGMENT_WRITE_KEY__);

import { sizeMap, pizzaMap } from '../lib/utilities';

if (!Object.values) {
  values.shim();
}

const whisperLogger = createChannelLogger('whisperlogs');
const activeWhispers = {};
const channelSettings = {};

const initializeChannel = (channel) => {
  const streamerId = channel.replace('#', '');

  return new Promise((resolve, reject) => {
    User.findCreateFind({
      where: {
        twitch: streamerId,
      },
      defaults: {
        twitch: streamerId,
        email: '',
        is_bot_present: true,
      },
    }).spread((myChannel, created) => {
      if (created) {
        logger.info('created a new channel', channel);

        channelSettings[channel] = {
          obj: myChannel,
          streamerId,
          logger: createChannelLogger(streamerId),
          lastOneTimeAd: 0,
          lastModeratorDetection: 0,
        };

        resolve();
      } else {
        myChannel.update({
          is_bot_present: true,
        })
        .then(() => {
          channelSettings[channel] = {
            obj: myChannel,
            streamerId,
            logger: createChannelLogger(streamerId),
            lastOneTimeAd: 0,
            lastModeratorDetection: 0,
          };

          resolve();
        });
      }
    }).catch((error) => {
      reject(error);
    });
  });
};

// eslint-disable-next-line new-cap
const client = new tmi.client(options);

const getShortenedSiteUrl = (channel, username) => {
  const {
    pizzaId,
    size,
  } = activeWhispers[username];

  const streamerId = channel.replace('#', '');
  const url = `${siteUrl}/${streamerId}/${username}?pizza=${pizzaId}&size=${size}`;

  return helpers.getShortenedUrl(url);
};

const checkForModeratorStatus = (channel, isModerator) => {
  // if moderator settings have changed, update the DB
  if (channelSettings[channel].obj.get('is_bot_moderator') !== isModerator) {
    channelSettings[channel].obj.update({
      is_bot_moderator: isModerator,
    }).then(() => {
      if (isModerator) {
        client.say(channel, 'Moderator status detected! Hungrybot is now a moderator.');
      } else {
        client.say(channel, 'Moderator status detected! Hungrybot is not a moderator anymore.');
      }
    }).catch((error) => {
      logger.error('error updating channel', error);
    });
  }
};

const advertiseBot = (channel) => {
  const settings = channelSettings[channel];
  if (settings && settings.obj && settings.obj.get('is_bot_present') && settings.obj.get('is_bot_moderator')) {
    // if advertisements are disabled, we don't write but we still loop in case the user decides to enable ads again
    if (settings.obj.get('advertisements_enabled')) {
      client.say(channel, conversation.advertisement);
    }

    // broadcast the advertisement at a cadence set by the streamer
    const cadence = settings.obj.get('advertisement_cadence');
    if (typeof cadence === 'number' && cadence > 0) {
      // cadence is stored as minutes, so we convert it to milliseconds
      clearTimeout(channelSettings[channel].timeoutId);
      channelSettings[channel].timeoutId = setTimeout(advertiseBot, cadence * 60000, channel);

      const channelLogger = channelSettings[channel].logger;
      channelLogger.info(
        `${helpers.formatDate(new Date())} new ad will happen in ${cadence} minute(s) in ${channel}`);
    }
  }
};

const whisperAndLog = (username, message) => {
  client.whisper(username, message);

  const activeWhisper = activeWhispers[username];
  const whisperLogEntry = activeWhisper
    ? `${helpers.formatDate(new Date())}[${activeWhisper.channel}] TO <${username}>: ${message}`
    : `${helpers.formatDate(new Date())}[Unknown] TO <${username}>: ${message}`;
  whisperLogger.info(whisperLogEntry);
};

const checkForAdminCommand = (message, username) => {
  let commandIssued = true;
  const messageContents = message.split(' ');
  const channel = helpers.getChannelFromString(messageContents[1]);

  switch (messageContents[0]) {
    // the format is...
    // whisper: !join <channel>
    case adminCommands.join:
      if (channel) {
        client.join(channel);
        whisperAndLog(username, `Joined channel ${channel}`);
      } else {
        whisperAndLog(username, 'Invalid command format');
        commandIssued = false;
      }
      break;

    // the format is...
    // whisper: !leave <channel>
    case adminCommands.leave:
      if (channel) {
        client.part(channel);
        whisperAndLog(username, `Left channel ${channel}`);
      } else {
        whisperAndLog(username, 'Invalid command format');
        commandIssued = false;
      }
      break;

    default:
      commandIssued = false;
      break;
  }

  return commandIssued;
};

const expireConversation = (username) => {
  clearTimeout(activeWhispers[username].timeoutId);
  delete activeWhispers[username];
};

const followUpConversation = (username) => {
  if (activeWhispers[username]) {
    clearTimeout(activeWhispers[username].followUpId);
    activeWhispers[username].prevStep = activeWhispers[username].step;
    activeWhispers[username].step = 6;
    activeWhispers[username].followedUp = true;

    whisperAndLog(username, conversation.step6);
  }
};

const increaseFollowUpTimeout = (username) => {
  if (activeWhispers[username] && !activeWhispers[username].followedUp) {
    clearTimeout(activeWhispers[username].followUpId);

    // follow up with the user 5 minutes after their last interaction with the bot
    activeWhispers[username].followUpId = setTimeout(followUpConversation, 300000, username);
  }
};

const beginNewConversation = (username, channel) => {
  activeWhispers[username] = {
    channel,
    streamerId: channel.replace('#', ''),
    step: 1,
  };

  whisperAndLog(username, conversation.step1);

  // clear the conversation after 3 hours in milliseconds
  activeWhispers[username].timeoutId = setTimeout(expireConversation, 10800000, username);

  // follow up with the user 5 minutes after their last interaction with the bot
  increaseFollowUpTimeout(username);
};

const handleWhisper = (username, message) => {
  const userResponse = message ? message.toLowerCase() : message;
  const activeWhisper = activeWhispers[username];
  if (activeWhisper) {
    const channel = activeWhisper.channel;

    switch (userResponse) {
      case whisperCommands.restart:
        analytics.track({
          userId: username,
          event: 'Restarted order',
          properties: {
            streamerId: channel.substring(1),
          },
        });

        expireConversation(username);
        beginNewConversation(username, channel);
        return;

      default:
        break;
    }

    const prefix = userResponse ? conversation.error_prefix : conversation.almost_prefix;
    switch (activeWhisper.step) {
      case 1:
        if (pizzaMap[userResponse]) {
          analytics.track({
            userId: username,
            event: 'Chose a type',
            properties: {
              streamerId: channel.substring(1),
              pizzaType: userResponse,
            },
          });

          whisperAndLog(username, conversation.step2);

          activeWhisper.pizzaId = userResponse;
          activeWhisper.step++;
        } else {
          whisperAndLog(username,
            `${prefix}${conversation.toppingsMenu}${conversation.restart_suffix}`);
        }

        // follow up with the user 5 minutes after their last interaction with the bot
        increaseFollowUpTimeout(username);
        break;

      case 2:
        if (sizeMap[userResponse]) {
          analytics.track({
            userId: username,
            event: 'Chose a size',
            properties: {
              streamerId: channel.substring(1),
              pizzaSize: userResponse,
            },
          });

          activeWhisper.size = userResponse;

          getShortenedSiteUrl(activeWhisper.channel, username)
            .then((response) => response.json())
            .then((json) => {
              if (json.id) {
                whisperAndLog(username,
                  conversation.step3.format(json.id, activeWhisper.streamerId));

                activeWhisper.url = json.id;
                activeWhisper.step++;
              } else {
                logger.error('there was an error generating a short url');
              }
            })
            .catch((error) => {
              logger.error('there was an error parsing the json', error);
            });
        } else {
          whisperAndLog(username,
            `${prefix}${conversation.sizeMenu}${conversation.restart_suffix}`);
        }

        // follow up with the user 5 minutes after their last interaction with the bot
        increaseFollowUpTimeout(username);
        break;

      case 3: {
        const text = conversation.step3.format(activeWhisper.url, activeWhisper.streamerId);
        whisperAndLog(username, `${text}${conversation.restart_suffix}`);

        // follow up with the user 5 minutes after their last interaction with the bot
        increaseFollowUpTimeout(username);
        break;
      }

      case 5:
        whisperAndLog(username, conversation.followUp);

        // follow up with the user 5 minutes after their last interaction with the bot
        increaseFollowUpTimeout(username);
        break;

      case 6:
        // after receiving user feedback, revert to the previous step in the workflow
        activeWhisper.step = activeWhisper.prevStep;
        break;

      default:
        break;
    }
  }

  const whisperLogEntry = activeWhisper
    ? `${helpers.formatDate(new Date())}[${activeWhisper.channel}] FROM <${username}>: ${message}`
    : `${helpers.formatDate(new Date())}[Unknown] FROM <${username}>: ${message}`;
  whisperLogger.info(whisperLogEntry);
};

const handleChat = (channel, userstate, message) => {
  const lowerCaseMessage = message.toLowerCase();

  // non-moderated commands
  if (!channelSettings[channel].obj.get('is_bot_moderator')) {
    switch (lowerCaseMessage) {
      case chatCommands.hungrybot:
        client.say(channel, conversation.moderatorNeeded);
        break;

      default:
        break;
    }
  } else {
    switch (lowerCaseMessage) {
      case chatCommands.pizza:
        // if there is already an active conversation, just retry the last whisper
        if (!activeWhispers[userstate.username]) {
          analytics.track({
            userId: userstate.username,
            event: 'Started an order',
            properties: {
              streamerId: channel.substring(1),
            },
          });

          beginNewConversation(userstate.username, channel);
        } else {
          analytics.track({
            userId: userstate.username,
            event: 'Started an order (existing conversation)',
            properties: {
              streamerId: channel.substring(1),
            },
          });

          handleWhisper(userstate.username);
        }
        break;

      default:
        break;
    }
  }
};

export function receivePizzaPayment(username, optionalDonation) {
  return new Promise((resolve) => {
    if (activeWhispers[username]) {
      const activeWhisper = activeWhispers[username];
      activeWhisper.step++;

      const channel = activeWhisper.channel;

      // whisper the streamer that someone just bought pizza from their channel
      if (optionalDonation) {
        whisperAndLog(activeWhisper.streamerId,
          conversation.purchaseWithDonation.format(username, optionalDonation));
      } else {
        whisperAndLog(activeWhisper.streamerId,
          conversation.purchase.format(username));
      }

      // whisper the user that we just received their payment
      whisperAndLog(username, conversation.step4.format(activeWhisper.streamerId));

      // if the streamer has configured the bot to announce orders, do so now
      const announceOrders = channelSettings[channel].obj.get('announce_orders');
      if (announceOrders) {
        let message;
        if (optionalDonation) {
          message = conversation.orderAnnouncementWithDonation.format(username, optionalDonation);
        } else {
          message = conversation.orderAnnouncement.format(username);
        }

        client.say(channel, message);
      }
    }

    resolve();
  });
}

export function receiveTrackingInformation(username, trackingUrl) {
  return new Promise((resolve, reject) => {
    if (activeWhispers[username]) {
      activeWhispers[username].step++;

      helpers.getShortenedUrl(trackingUrl)
        .then((response) => response.json())
        .then((json) => {
          if (json.id) {
            whisperAndLog(username, conversation.step5.format(json.id));
            resolve();
          } else {
            logger.error('there was an error generating a short url', trackingUrl);

            whisperAndLog(username, conversation.step5.format(trackingUrl));
            resolve();
          }
        })
        .catch((error) => {
          logger.error('there was an error parsing the json', error);

          whisperAndLog(username, conversation.step5.format(trackingUrl));
          resolve();
        });
    } else {
      reject('no active conversation with that username');
    }
  });
}

export function isPresentInChannel(username) {
  const channel = helpers.getChannelFromString(username);
  const settings = channelSettings[channel];

  return settings && settings.obj && settings.obj.get('is_bot_present');
}

export function joinChannel(username) {
  if (!isPresentInChannel(username)) {
    const channel = helpers.getChannelFromString(username);
    client.join(channel);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const settings = channelSettings[channel];
        if (settings && settings.obj && settings.obj.get('is_bot_present')) {
          resolve();
        } else {
          reject('Bot is not present yet');
        }
      }, 1000);
    });
  }

  return Promise.resolve();
}

export function leaveChannel(username) {
  if (isPresentInChannel(username)) {
    const channel = helpers.getChannelFromString(username);
    const settings = channelSettings[channel];
    client.part(channel);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (settings && settings.obj && settings.obj.get('is_bot_present') === false) {
          resolve();
        } else {
          reject('Bot hasn\'t left the channel yet yet');
        }
      }, 1000);
    });
  }

  return Promise.resolve();
}

export function toggleAdvertisements(username, adsEnabled) {
  const channel = helpers.getChannelFromString(username);
  const settings = channelSettings[channel];

  if (settings && settings.obj) {
    return settings.obj.update({
      advertisements_enabled: adsEnabled,
    });
  }

  return Promise.reject('no channel with that username present');
}

export function detectModeratorStatus(username) {
  const channel = helpers.getChannelFromString(username);
  const settings = channelSettings[channel];

  if (settings && settings.obj && settings.obj.get('is_bot_present')) {
    client.say(channel, 'Detecting moderator status...');

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (settings.obj.get('is_bot_moderator')) {
          resolve();
        } else {
          reject('Bot is not a moderator yet');
        }
      }, 1000);
    });
  }

  return Promise.reject('no channel with that username present');
}

/* eslint-disable no-param-reassign */
function startAdvertisingLoop(settings, channel) {
  const cadence = settings && settings.obj.get('advertisement_cadence');
  if (!settings.adLoopStarted && typeof cadence === 'number' && cadence > 0) {
    logger.info(`started advertising loop for ${channel}`);
    settings.adLoopStarted = true;
    settings.timeoutId = setTimeout(advertiseBot, cadence * 60000, channel);
  }
}
/* eslint-enable no-param-reassign */

export function updateSettings(username, cadence, paypal) {
  const channel = helpers.getChannelFromString(username);
  const settings = channelSettings[channel];

  if (settings && settings.obj) {
    startAdvertisingLoop(settings, channel);

    return settings.obj.update({
      advertisement_cadence: cadence,
      paypal,
    });
  }

  return Promise.reject('no channel with that username present');
}

export function advertiseOnce(username) {
  const channel = helpers.getChannelFromString(username);
  const settings = channelSettings[channel];

  // only allow streamers to do this once every 30 minutes
  if (settings && settings.obj && settings.obj.get('is_bot_present') && settings.obj.get('is_bot_moderator') &&
    ((new Date()) - settings.lastOneTimeAd > 180000)) {
    client.say(channel, conversation.advertisement);
  }
}

client.on('join', (channel, username, self) => {
  if (!self) {
    return;
  }

  const settings = channelSettings[channel];
  if (!settings) {
    initializeChannel(channel)
      .then(() => {
        logger.info(`initialized and joined channel ${channel}`);
      })
      .catch((error) => {
        logger.error('error initializing the channel', error);
      });
  } else if (settings.obj && !settings.obj.get('is_bot_present')) {
    settings.obj.update({
      is_bot_present: true,
    })
    .then(() => {
      logger.info(`joined and updated channel ${channel}`);
      startAdvertisingLoop(settings, channel);
    })
    .catch((error) => {
      logger.error('error updating the channel', error);
    });
  } else if (settings.obj) {
    logger.info(`joined channel ${channel}`);
    startAdvertisingLoop(settings, channel);
  }
});

client.on('part', (channel, username, self) => {
  if (!self) {
    return;
  }

  if (channelSettings[channel]) {
    channelSettings[channel].obj.update({
      is_bot_present: false,
    })
    .then(() => {
      logger.info(`left channel ${channel}`);
    })
    .catch((error) => {
      logger.error('error leaving the channel', error);
    });
  }
});

client.on('chat', (channel, userstate, message, self) => {
  if (!channelSettings[channel] || !channelSettings[channel].obj.get('is_bot_present')) {
    logger.info('bot is not present in this channel!', channel);
  }

  channelSettings[channel].previousMessage = message;

  const channelLogger = channelSettings[channel].logger;
  channelLogger.info(
    `${helpers.formatDate(new Date())} <${userstate.username}>: ${message}`);

  if (self) {
    checkForModeratorStatus(channel, userstate['user-type'] === 'mod');

    // don't process self messages
    return;
  }

  handleChat(channel, userstate, message);
});

client.on('whisper', (from, userstate, message, self) => {
  const username = userstate.username;

  if (self) {
    return;
  }

  if (adminList.includes(username)) {
    if (checkForAdminCommand(message, username)) {
      // if we processed an admin command, no need to process any other commands
      return;
    }
  }

  handleWhisper(username, message);
});

client.connect()
  .then((result) => {
    logger.info('connected', result);

    User.findAll()
      .then((users) => {
        users.forEach((user) => {
          const streamerId = user.get('twitch');
          const channel = `#${streamerId}`;
          channelSettings[channel] = {
            obj: user,
            streamerId,
            logger: createChannelLogger(streamerId),
            lastOneTimeAd: 0,
            lastModeratorDetection: 0,
          };

          client.join(channel);
        });
      });
  })
  .catch((err) => {
    logger.error('rejected', err);
  });

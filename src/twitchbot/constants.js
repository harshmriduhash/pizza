import { stringFormatter } from './helpers';
const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isIntegration = process.env.NODE_ENV === 'integration';

// eslint-disable-next-line no-unused-vars
import { logger } from './logger';

let botName;
let botPassword;
let defaultChannel;
let siteUrl;

if (isProduction) {
  botName = 'the_hungrybot';
  botPassword = '';
  defaultChannel = '#nice_johnbot';
  siteUrl = 'https://app.hungrybot.co/order';
} else if (isIntegration) {
  botName = 'hungry_pizza_bot';
  botPassword = '';
  defaultChannel = '#johnhforrest';
  siteUrl = 'https://int.hungrybot.co/order';
} else {
  botName = 'hurpington';
  botPassword = '';
  defaultChannel = '#nice_johnbot';
  siteUrl = 'http://localhost:8080/order';
}

module.exports = {
  adminList: [
    'johnhforrest',
    'playing_2_win',
    'insurrectionnel',
  ],
  adminCommands: {
    clear: '!clear', // currently not in use
    join: '!join',
    leave: '!leave',
    announce: '!announce',
    disableAds: '!no_ads',
  },
  chatCommands: {
    hungrybot: '!hungrybot',
    pizza: '!pizza',
  },
  whisperCommands: {
    restart: 'r',
    on: '!on',
    off: '!off',
  },
  conversation: {
    almost_prefix: 'You\'re almost done with your order! ',
    error_prefix: 'I didn\'t understand that :(. ',
    restart_suffix: ' If you want to start the checkout sequence again, type R.',

    toppingsMenu: 'Type | 1 for Pepperoni | 2 for Cheese | 3 for Hawaiian | 4 for Sausage | 5 for Mushroom',
    sizeMenu: 'Type | S for Small (10") | M for Medium (12") | L for Large (14").',

    step1: `Hi, I’m Hungrybot. For a LIMITED time, I will deliver Domino's pizza at 50%!! OFF.
    Here’s what I’m serving today:
    Type | 1 for Pepperoni | 2 for Cheese | 3 for Hawaiian | 4 for Sausage | 5 for Mushroom`,

    step2: `Great choice! What size do you want?
    Type | S for Small (10") | M for Medium (12") | L for Large (14").`,

    step3: stringFormatter`Almost done. Click ${0} to securely checkout,
    receive your pizza at 50% OFF, and donate to ${1}.
    Please email eric@septur.com if you have any problems.`,

    step4: stringFormatter`We received your payment!
    Your pizza is on its way and we sent ${0} your message.
    You will receive your tracking link via whisper shortly.
    Please email eric@septur.com if you have any problems.`,

    step5: stringFormatter`Copy ${0} into your browser to track your pizza!`,

    step6: 'Thanks for using Hungrybot today! How was your experience? What can we do better?',

    followUp: 'Your pizza is on it\'s way! Type R to start a new order.',

    purchase: stringFormatter`${0} just purchased pizza from your channel!`,
    purchaseWithDonation: stringFormatter`${0} just purchased pizza from your channel and
    donated $${1}!`,

    alreadyActive: `You already have an active conversation.
    Whisper !restart to start over.`,

    moderatorNeeded: `${botName} isn't talking until moderated.
    Type "/mod ${botName}" to get started!`,

    advertisement: `For a LIMITED TIME, get Domino's pizza at 50% OFF!
    Type !pizza to delivery to yourself. Find out more at hungrybot.co`,

    orderAnnouncement: stringFormatter`${0} just ordered a pizza! Order one for yourself at 50% OFF by typing !pizza.`,
    orderAnnouncementWithDonation: stringFormatter`${0} just ordered a pizza and donated $${1}!
    Order a pizza for yourself at 50% OFF by typing !pizza.`,
  },
};

const defaultChannels = isDev
  ? ['#hungry_pizza_bot', defaultChannel]
  : ['#playing_2_win', defaultChannel];

const options = {
  options: {
    debug: false,
  },
  connection: {
    reconnect: true,
  },
  identity: {
    username: botName,
    password: botPassword,
  },
  channels: isProduction ? [] : defaultChannels,
  //logger: winston,
};

Object.assign(module.exports, {
  defaultChannel,
  siteUrl,
  options,
});

import fetch from 'node-fetch';
import defines from '../../config/env';

// eslint-disable-next-line no-unused-vars
import { logger } from './logger';

module.exports = {
  getChannelFromString(potentialChannel) {
    if (!potentialChannel) {
      return potentialChannel;
    }

    if (potentialChannel[0] === '#') {
      return potentialChannel;
    }

    return `#${potentialChannel}`;
  },

  getShortenedUrl(url) {
    return fetch(`https://www.googleapis.com/urlshortener/v1/url?key=${defines.__GAPI_KEY__}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        longUrl: url,
      }),
    });
  },

  stringFormatter(literals, ...keys) {
    return {
      format: (...replacements) => {
        const result = [literals[0]];

        keys.forEach((key, i) => {
          result.push(replacements[i], literals[i + 1]);
        });

        return result.join('');
      },
    };
  },

  formatDate(dateTime) {
    const date = dateTime.toLocaleDateString();
    let hours = dateTime.getHours();
    let mins = dateTime.getMinutes();

    hours = (hours < 10 ? '0' : '') + hours;
    mins = (mins < 10 ? '0' : '') + mins;

    return `[${date}][${hours}:${mins}]`;
  },
};

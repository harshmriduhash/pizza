import winston from 'winston';

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

const createChannelLogger = (streamerId) => {
  const channelLogger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: 'error' }),
      new (winston.transports.File)({
        filename: `./logs/chat_${streamerId}.log`,
        level: 'info',
        timestamp: false,
      }),
    ],
  });

  return channelLogger;
};

module.exports = {
  logger,
  createChannelLogger,
};

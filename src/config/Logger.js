const winston = require('winston');

module.exports = function (correlationId) {
  const logger = winston.createLogger({
    transports: [new winston.transports.Console({ level: 'debug' })],
  });

  logger.format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(function (info) {
      if (correlationId) {
        return `[${info.level.toUpperCase()}][${
          info.timestamp
        }][${correlationId}] ${info.message}`;
      } else {
        return `[${info.level.toUpperCase()}][${info.timestamp}] ${
          info.message
        }`;
      }
    })
  );

  return logger;
};

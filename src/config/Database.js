const mongoose = require('mongoose');
const Settings = require('./Settings');
const Logger = require('./logger');

module.exports = class Database {
  static connect() {
    const logger = new Logger();

    mongoose.connect(Settings.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    mongoose.set('debug', true);

    mongoose.connection.on('connected', function () {
      logger.debug('Mongoose! Connected at ' + Settings.mongoUrl);
    });

    mongoose.connection.on('disconnected', function () {
      logger.debug('Mongoose! Disconnected em ' + Settings.mongoUrl);
    });

    mongoose.connection.on('error', function (erro) {
      logger.error('Mongoose! Error : ' + erro);
    });

    process.on('SIGINT', function () {
      mongoose.connection.close(function () {
        logger.error('Mongoose! Disconnected by the application');
        process.exit(0);
      });
    });

    return mongoose;
  }
};

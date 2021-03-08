const DateHelper = require('./DateHelper');
const JWTHelper = require('./JWTHelper');
const MutexHelper = require('./MutexHelper');
const { DocumentHelper, IdentityHelper } = require('encryptify-lib');

module.exports = class HelperFactory {
  static getDateHelper(logger) {
    return new DateHelper({}, logger);
  }

  static getJWTHelper(logger) {
    return new JWTHelper({}, logger);
  }

  static getMutexHelper() {
    return new MutexHelper();
  }
};

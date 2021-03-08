const { IdentityHelper } = require('encryptify-lib');

const DAppBO = require('./DAppBO');
const EventBO = require('./EventBO');
const UserBO = require('./UserBO');
const Model = require('./Model');
const HelperFactory = require('../helpers/HelperFactory');

const dapp = require('../models/dapp');
const event = require('../models/event');
const user = require('../models/user');

module.exports = class BOFactory {
  static getDAppBO(logger) {
    return new DAppBO(
      {
        model: new Model(dapp, logger),
        identityHelper: IdentityHelper,
        dateHelper: HelperFactory.getDateHelper(logger),
      },
      logger
    );
  }

  static getEventBO(logger) {
    return new EventBO(
      {
        model: new Model(event, logger),
        dateHelper: HelperFactory.getDateHelper(logger),
      },
      logger
    );
  }

  static getUserBO(logger) {
    return new UserBO(
      {
        model: new Model(user, logger),
        identityHelper: IdentityHelper,
        dateHelper: HelperFactory.getDateHelper(logger),
      },
      logger
    );
  }
};

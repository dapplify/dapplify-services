const { IdentityHelper } = require('encryptify-lib');

const DAppBO = require('./DAppBO');
const AddressBO = require('./AddressBO');
const EventBO = require('./EventBO');
const UserBO = require('./UserBO');
const Model = require('./Model');
const HelperFactory = require('../helpers/HelperFactory');

const dapp = require('../models/dapp');
const addressDetail = require('../models/address');
const event = require('../models/event');
const user = require('../models/user');

module.exports = class BOFactory {
  static getAddressBO(logger) {
    return new AddressBO(
      {
        model: new Model(addressDetail, logger),
        dateHelper: HelperFactory.getDateHelper(logger),
      },
      logger
    );
  }

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

const HelperFactory = require('../helpers/HelperFactory');
const BOFactory = require('../business/BOFactory');
const Logger = require('../config/Logger');
const { v4 } = require('uuid');

const uuidv4 = v4;

module.exports = class BaseMiddleware {
  static parseSorting() {
    return (req, res, next) => {
      const { sort, limit, offset } = req.query;
      req.pagination = {
        sort,
        limit: isNaN(limit) ? 10 : parseInt(limit),
        skip: isNaN(offset) ? 0 : parseInt(offset),
      };

      next();
    };
  }
  static createLogger() {
    return (req, res, next) => {
      const correlationId = uuidv4();

      req.logger = new Logger(correlationId);
      req.logger.request = req;

      res.append('x-correlation-id', correlationId);
      next();
    };
  }

  static requireLogin() {
    return (req, res, next) => {
      if (req.currentUser) {
        next();
      } else {
        res.status(403).json({
          code: 'INVALID_JWT_TOKEN',
        });
      }
    };
  }

  static parseCurrentUser() {
    return async (req, res, next) => {
      const jwtHelper = HelperFactory.getJWTHelper();
      const userBO = BOFactory.getUserBO(req.logger);

      req.logger.debug(
        '[BaseMiddleware.parseCurrentUser()] Checking if there is Bearer Authorization token'
      );

      if (
        req.headers['authorization'] &&
        req.headers['authorization'].startsWith('Bearer ')
      ) {
        req.logger.info(
          '[BaseMiddleware.parseCurrentUser()] There is a Bearer Authorization token'
        );
        const data = req.headers['authorization'].split(' ');
        const token = data[1];

        try {
          req.logger.debug(
            `[BaseMiddleware.parseCurrentUser()] Decoding the token: ${token}`
          );
          const user = jwtHelper.decodeToken(token);

          if (user) {
            req.logger.debug(
              `[BaseMiddleware.parseCurrentUser()] Current user is ${user.address}`
            );
            req.currentUser = await userBO.getByAddress(user.address);

            next();
          } else {
            req.logger.warn(
              '[BaseMiddleware.parseCurrentUser()] The Bearer Authorization is invalid'
            );
            res.status(401).json({
              code: 'INVALID_JWT_TOKEN',
            });
          }
        } catch (e) {
          console.log(e);
          res.status(401).json({
            code: 'INVALID_JWT_TOKEN',
          });
        }
      } else {
        req.logger.info(
          '[BaseMiddleware.parseCurrentUser()] There is no Bearer Authorization token'
        );
        next();
      }
    };
  }

  static parseCurrentDApp(isRequired) {
    return async (req, res, next) => {
      const dappBO = BOFactory.getDAppBO(req.logger);

      req.logger.debug(
        '[BaseMiddleware.parseCurrentDApp()] Checking if there is a uniqueId param'
      );

      const { uniqueId } = req.params;

      if (uniqueId) {
        req.dapp = await dappBO.getByUniqueId({ uniqueId });
      }

      if (req.dapp) {
        req.logger.debug(
          '[BaseMiddleware.parseCurrentDApp()] A DApp was found'
        );

        next();
      } else {
        req.logger.debug(
          '[BaseMiddleware.parseCurrentDApp()] A DApp was NOT found'
        );

        if (isRequired) {
          res.status(404).json({
            code: 'DAPP_NOT_FOUND',
          });
        }
      }
    };
  }
};

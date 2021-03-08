const jwt = require('jsonwebtoken');
const Settings = require('../config/Settings.js');

module.exports = class JWTHelper {
  constructor(_, logger) {
    this.logger = logger;
  }

  createToken(user, jwtSettings) {
    jwtSettings = jwtSettings || Settings.jwt;
    this.logger.debug(
      `[JWTHelper.createToken()] Creating a new JWT token (expiresIn: ${jwtSettings.expiresIn})`
    );
    return jwt.sign(user, jwtSettings.secret, {
      expiresIn: jwtSettings.expiresIn,
    });
  }

  decodeToken(token, jwtSettings) {
    jwtSettings = jwtSettings || Settings.jwt;

    try {
      return jwt.verify(token, jwtSettings.secret);
    } catch (err) {
      console.log(err);
      return null;
    }
  }
};

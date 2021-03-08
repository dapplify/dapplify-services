module.exports = class DateHelper {
  constructor(_, logger) {
    this.logger = logger;
  }

  getNow() {
    return new Date();
  }
};

// preventing ERR max number of clients reached from REDIS
const Settings = require('../config/Settings');
const mutex = require('node-mutex');

const m = mutex(Settings.mutex);

module.exports = class MutexHelper {
  getMutex(key) {
    return m.lock(key);
  }
};

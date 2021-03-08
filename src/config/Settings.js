const env = require('node-env-file');

if (process.env.ENV_FILE) {
  env(process.env.ENV_FILE);
}

module.exports = {
  mongoUrl: process.env.MONGO_URL,
  port: process.env.PORT,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },

  payloadLimit: process.env.PAYLOAD_LIMIT,

  mutex: {
    url: {
      port: process.env.REDIS_DB_PORT,
      host: process.env.REDIS_DB_SERVER,
      password: process.env.REDIS_DB_PASSWORD,
    },
  },
};

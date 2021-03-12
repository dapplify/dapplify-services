const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const Settings = require('./config/Settings.js');
const DAppRoute = require('./routes/DAppRoute.js');
const UserRoute = require('./routes/UserRoute.js');
const AddressRoute = require('./routes/AddressRoute.js');
const Logger = require('./config/logger.js');
const Database = require('./config/Database.js');
const BaseMiddleware = require('./routes/BaseMiddleware.js');

Database.connect();

var app = express();

app.use(logger('dev'));
app.use(express.json({ limit: Settings.payloadLimit }));
app.use(express.urlencoded({ extended: false, limit: Settings.payloadLimit }));
app.use(cookieParser());

app.use(BaseMiddleware.parseSorting());
app.use(BaseMiddleware.createLogger());
app.use(BaseMiddleware.parseCurrentUser());
app.use(BaseMiddleware.parseCurrentDApp());

app.listen(Settings.port, () => {
  const logger = new Logger();
  logger.debug(`dApplify Tools Service listening at port ${Settings.port}`);
});

DAppRoute.configure(app);
AddressRoute.configure(app);
UserRoute.configure(app);

module.exports = app;

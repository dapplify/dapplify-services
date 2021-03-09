const BOFactory = require('../business/BOFactory');
const RequestRunner = require('./RequestRunner');
const HelperFactory = require('../helpers/HelperFactory');
const EventType = require('../business/EventType');

module.exports = class DocumentRoute {
  static configure(app) {
    app
      .route('/v1/users/:address/pin')
      .get(RequestRunner.run(200, DocumentRoute.getPin));

    app.route('/v1/users').post(RequestRunner.run(201, DocumentRoute.save));

    app
      .route('/v1/users/auth')
      .post(RequestRunner.run(200, DocumentRoute.checkPinSignature));

    app.route('/v1/users/me').get(RequestRunner.run(200, DocumentRoute.getMe));

    app
      .route('/v1/dapps/:uniqueId/users/:address/pin')
      .get(RequestRunner.run(200, DocumentRoute.getPin));

    app
      .route('/v1/dapps/:uniqueId/users/auth')
      .post(RequestRunner.run(200, DocumentRoute.checkPinSignature));
  }

  static async getPin(req) {
    const bo = BOFactory.getUserBO(req.logger);
    const { pin, address } = await bo.updatePin(req.params.address);

    return { pin, address };
  }

  static save(req) {
    const bo = BOFactory.getUserBO(req.logger);
    return bo.save({ ...req.body });
  }

  static async checkPinSignature(req) {
    const jwtHelper = HelperFactory.getJWTHelper(req.logger);
    const bo = BOFactory.getUserBO(req.logger);
    const dappBO = BOFactory.getDAppBO(req.logger);
    const eventBO = BOFactory.getEventBO(req.logger);

    const { address, pin, signature } = req.body;
    const { uniqueId } = req.params;

    if (!(await bo.checkPinSignature(address, pin, signature))) {
      throw {
        code: 'INVALID_PIN_SIGNATURE',
        pin,
        signature,
        address,
      };
    }

    const dapp = await dappBO.getByUniqueId({ uniqueId });
    const jwtConfig = dapp ? dapp.jwt : null;

    if (uniqueId && !dapp) {
      throw {
        status: 404,
        code: 'DAPP_NOT_FOUND',
        uniqueId,
      };
    }

    const token = jwtHelper.createToken({ address }, jwtConfig);

    if (dapp) {
      await eventBO.save({
        type: EventType.LOGIN,
        title: `A JWT token was generated to ${address}`,
        dapp,
        data: {
          token,
          address,
          pin,
        },
        address,
      });
    }

    await bo.updatePin(address);

    return {
      token,
      address,
      pin,
      signature,
    };
  }

  static async getMe(req) {
    return req.currentUser;
  }
};

const BOFactory = require('../business/BOFactory');
const RequestRunner = require('./RequestRunner');
const BaseMiddleware = require('./BaseMiddleware');
const EventType = require('../business/EventType');

module.exports = class AddressRoute {
  static configure(app) {
    app
      .route('/v1/dapps/:uniqueId/addresses')
      .get(
        BaseMiddleware.requireLogin(),
        BaseMiddleware.parseCurrentDApp(true),
        RequestRunner.run(200, AddressRoute.getAll)
      )
      .post(
        BaseMiddleware.requireLogin(),
        BaseMiddleware.parseCurrentDApp(true),
        RequestRunner.run(201, AddressRoute.save)
      );

    app
      .route('/v1/dapps/:uniqueId/addresses/:address')
      .get(
        BaseMiddleware.requireLogin(),
        BaseMiddleware.parseCurrentDApp(true),
        RequestRunner.run(200, AddressRoute.getByAddress)
      )
      .put(
        BaseMiddleware.requireLogin(),
        BaseMiddleware.parseCurrentDApp(true),
        RequestRunner.run(200, AddressRoute.update)
      );
  }

  static async save(req) {
    const bo = BOFactory.getAddressDetailBO(req.logger);
    const eventBO = BOFactory.getEventBO(req.logger);

    const dapp = req.dapp;

    const entity = { ...req.body };

    if (
      dapp.from.toLowerCase() !== req.currentUser.address.toLowerCase() &&
      entity.address.toLowerCase() !== req.currentUser.address.toLowerCase()
    ) {
      req.logger.warn(
        '[AddressRoute.update()] Current user is not the dapp owner to add new addresses'
      );

      throw {
        status: 401,
        code: 'REQUIRES_DAPP_OWNER',
      };
    }

    if (dapp.from !== req.currentUser.address) {
      req.logger.info(
        '[AddressRoute.save()] Current user is not the dapp owner. The roles will be set as [user]'
      );

      entity.roles = ['user'];
    }

    entity.dapp = dapp;
    entity.createdBy = req.currentUser.address.toLowerCase();
    const newItem = await bo.save(entity);

    await eventBO.save({
      type: EventType.NEW_ADDRESS_DETAIL,
      title: `A new address detail was created to ${entity.address}`,
      dapp,
      data: entity,
      address: entity.address,
    });

    return newItem;
  }

  static async update(req) {
    const bo = BOFactory.getAddressDetailBO(req.logger);
    const eventBO = BOFactory.getEventBO(req.logger);
    const dapp = req.dapp;

    const entity = { ...req.body };

    if (
      dapp.from.toLowerCase() !== req.currentUser.address.toLowerCase() &&
      entity.address.toLowerCase() !== req.currentUser.address.toLowerCase()
    ) {
      req.logger.warn(
        '[AddressRoute.update()] Current user is not the dapp owner to update other address'
      );

      throw {
        status: 401,
        code: 'REQUIRES_DAPP_OWNER',
      };
    }

    const addressDetail = await bo.getAddressDetail({
      address: entity.address,
      uniqueId: dapp.uniqueId,
    });

    if (
      addressDetail.address !== req.currentUser.address &&
      dapp.from !== req.currentUser.address
    ) {
      throw {
        status: 401,
      };
    }

    if (dapp.from !== req.currentUser.address) {
      req.logger.info(
        '[AddressRoute.update()] Current user is not the dapp owner. The roles will be ignored'
      );

      entity.roles = addressDetail.roles;
    }

    entity.dapp = dapp;
    const item = await bo.update(entity);

    await eventBO.save({
      type: EventType.ADDRESS_DETAIL_UPDATED,
      title: `The address detail to ${entity.address} was updated`,
      dapp,
      data: entity,
      address: entity.address,
    });

    return item;
  }

  static getByAddress(req) {
    const bo = BOFactory.getAddressDetailBO(req.logger);
    const { uniqueId, address } = req.params;

    return bo.getAddressDetail({ uniqueId, address });
  }

  static getAll(req) {
    const { uniqueId } = req.params;
    const bo = BOFactory.getDocumentBO(req.logger);

    return bo.getAll({ uniqueId }, req.pagination);
  }
};

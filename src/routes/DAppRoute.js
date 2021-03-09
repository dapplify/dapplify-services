const BOFactory = require('../business/BOFactory');
const RequestRunner = require('./RequestRunner');
const BaseMiddleware = require('./BaseMiddleware');

module.exports = class DAppRoute {
  static configure(app) {
    app
      .route('/v1/dapps')
      .get(
        BaseMiddleware.requireLogin(),
        RequestRunner.run(200, DAppRoute.getAll)
      )
      .post(
        BaseMiddleware.requireLogin(),
        RequestRunner.run(201, DAppRoute.save)
      );

    app
      .route('/v1/dapps/:uniqueId')
      .get(
        BaseMiddleware.requireLogin(),
        RequestRunner.run(200, DAppRoute.getById)
      );
  }

  static save(req) {
    const bo = BOFactory.getDAppBO(req.logger);
    const entity = { ...req.body };
    entity.from = req.currentUser.address;
    return bo.save(entity);
  }

  static getById(req) {
    const bo = BOFactory.getDAppBO(req.logger);

    const { uniqueId } = req.params;
    const from = req.currentUser.address;

    return bo.getByUniqueId({ uniqueId, from });
  }

  static getAll(req) {
    const { address: from } = req.currentUser;
    const bo = BOFactory.getDocumentBO(req.logger);

    return bo.getAll({ from }, req.pagination);
  }
};

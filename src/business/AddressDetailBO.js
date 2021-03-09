module.exports = class AddressDetailBO {
  constructor({ model, dateHelper }, logger) {
    this.logger = logger;
    this.model = model;
    this.dateHelper = dateHelper;
  }

  clear() {
    return this.model.clear();
  }

  async save(entity) {
    const { uniqueId } = entity.dapp;
    let { address } = entity;

    address = address.toLowerCase();

    const addressDetail = await this.getAddressDetail({ address, uniqueId });

    if (addressDetail) {
      throw {
        status: 409,
        code: 'ADDRESS_IN_USE',
        address,
      };
    }

    this.logger.debug(
      `[AddressDetailBO.save()] Processing a new address detail: ${address} - ${JSON.stringify(
        entity.roles
      )}`
    );

    const newEntity = await this.model.create({
      ...entity,
      address,
      createdAt: this.dateHelper.getNow(),
      isEnabled: true,
    });

    this.logger.debug(
      `[AddressDetailBO.save()] Entity saved successfully: ${address} - ${JSON.stringify(
        entity.roles
      )}`
    );

    return newEntity;
  }

  async update(entity) {
    const { uniqueId } = entity.dapp;
    let { address } = entity;

    address = address.toLowerCase();

    const addressDetail = await this.getAddressDetail({ address, uniqueId });
    const modelEntity = { ...entity, _id: addressDetail._id, address };

    return this.model.update(modelEntity);
  }

  getById(id) {
    return this.model.getFirstByFilter({ _id: id });
  }

  getAddressDetail({ address, uniqueId }) {
    address = address.toLowerCase();
    return this.model.getFirstByFilter({ address, 'dapp.uniqueId': uniqueId });
  }

  getAll({ uniqueId }, pagination) {
    const filter = { 'dapp.uniqueId': uniqueId };

    return this.model.getAllByFilter(filter, pagination);
  }
};

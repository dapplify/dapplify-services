module.exports = class DAppBO {
  constructor({ model, identityHelper, dateHelper }, logger) {
    this.logger = logger;
    this.model = model;
    this.identityHelper = identityHelper;
    this.dateHelper = dateHelper;
  }

  clear() {
    return this.model.clear();
  }

  async save(entity) {
    const byUniqueId = await this.getByUniqueId({ uniqueId: entity.uniqueId });

    if (byUniqueId) {
      throw {
        status: 409,
        code: 'USED_UNIQUEID',
      };
    }

    this.logger.debug(`[DAppBO.save()] Processing a new dapp: ${entity.name}`);

    const dappSource = {
      uniqueId: entity.uniqueId,
      name: entity.name,
      domain: entity.domain,
      from: entity.from,
      jwt: {
        secret: entity.jwt.secret,
        expiresIn: entity.jwt.expiresIn,
      },
    };

    this.logger.debug('[DAppBO.save()] Hashing the JSON content');
    const dappHash = this.identityHelper.generateHash(
      JSON.stringify(dappSource)
    );
    this.logger.debug(`[DAppBO.save()] The JSON content hash is ${dappHash}`);

    this.logger.debug(
      `[DAppBO.save()] Recovering the from address by the signature: ${entity.signature}`
    );
    const from = this.identityHelper
      .recoverAddress(entity.signature, dappHash)
      .toLowerCase();
    this.logger.debug(`[DAppBO.save()] Recovered address: ${from}`);

    if (from !== entity.from.toLowerCase()) {
      throw {
        status: 409,
        code: 'INVALID_FROM',
        from,
        entity,
      };
    }

    this.logger.debug(
      `[DAppBO.save()] Saving the entity to database: ${entity.name}`
    );

    const newEntity = await this.model.create({
      ...entity,
      from,
      createdAt: this.dateHelper.getNow(),
      isEnabled: true,
    });

    this.logger.debug(
      `[DAppBO.save()] Entity saved successfully: ${entity.name}`
    );

    return newEntity;
  }

  getByUniqueId({ uniqueId, from }) {
    if (from) {
      return this.model.getFirstByFilter({ uniqueId, from });
    } else {
      return this.model.getFirstByFilter({ uniqueId });
    }
  }

  async checkIfAddressIsOwner({ uniqueId, from }) {
    return (await this.getByUniqueId({ uniqueId, from })) !== null;
  }

  getAll({ from }, pagination) {
    return this.model.getAllByFilter({ from }, pagination);
  }
};

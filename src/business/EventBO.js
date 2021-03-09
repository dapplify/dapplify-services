module.exports = class DAppBO {
  constructor({ model, dateHelper }, logger) {
    this.logger = logger;
    this.model = model;
    this.dateHelper = dateHelper;
  }

  clear() {
    return this.model.clear();
  }

  async save(entity) {
    this.logger.debug(
      `[EventBO.save()] Processing a new event: ${entity.type} - ${entity.title}`
    );

    const newEntity = await this.model.create({
      ...entity,
      createdAt: this.dateHelper.getNow(),
      isEnabled: true,
    });

    this.logger.debug(
      `[EventBO.save()] Entity saved successfully: ${entity.type} - ${entity.title}`
    );

    return newEntity;
  }

  getAllByDAppUniqueId({ uniqueId, type }, pagination) {
    const filter = { 'dapp.uniqueId': uniqueId };

    if (type) {
      filter.type = type;
    }

    return this.model.getAllByFilter(filter, pagination);
  }
};

const $ = require('mongo-dot-notation');

module.exports = class Model {
  constructor(model, logger) {
    this.model = model;
    this.logger = logger;
  }

  clear() {
    this.logger.debug(
      `[Model#${this.model.collection.collectionName}.clear()] Clearing the collection`
    );
    return this.model.deleteMany({});
  }

  async create(document) {
    const item = await this.model.create(document);
    return item.toObject();
  }

  async update(document) {
    const item = await this.model.findOneAndUpdate(
      { _id: document._id },
      $.flatten(document),
      { new: true }
    );
    return item;
  }

  async getLastDocument() {
    return (
      await this.model.find({}).sort({ _id: -1 }).limit(1).lean().exec()
    )[0];
  }

  getFirstByFilter(filter) {
    this.logger.debug(
      `[Model#${
        this.model.collection.collectionName
      }.getFirstByFilter()] Getting the first item filter ${JSON.stringify(
        filter
      )}`
    );

    return this.model.findOne(filter).lean().exec();
  }

  async count(filter) {
    this.logger.debug(
      `[Model#${
        this.model.collection.collectionName
      }.count()] Counting items by filter ${JSON.stringify(filter)}`
    );

    const count = await this.model.estimatedDocumentCount(filter);

    this.logger.debug(
      `[Model#${this.model.collection.collectionName}.count()] Found items: ${count}`
    );

    return count;
  }

  async aggregate(filter, pipeline) {
    this.logger.debug(
      `[Model#${
        this.model.collection.collectionName
      }.aggregate()] Getting all in a pipeline by filter ${JSON.stringify(
        filter
      )}`
    );

    const items = await this.model.aggregate([
      {
        $match: filter,
      },
      ...pipeline,
    ]);

    items.total = items.length;

    this.logger.debug(
      `[Model#${this.model.collection.collectionName}.aggregate()] Items ${items.length}`
    );

    return items;
  }

  async getAllByFilter(filter, pagination) {
    if (!pagination) {
      pagination = {
        sort: '+createdAt',
      };
    }

    this.logger.debug(
      `[Model#${
        this.model.collection.collectionName
      }.getAllByFilter()] Getting all by filter ${JSON.stringify(filter)}`
    );

    const items = await this.model
      .find(filter, null, pagination)
      .sort(pagination.sort || '+createdAt')
      .lean()
      .exec();

    items.total = await this.count(filter);

    this.logger.debug(
      `[Model#${this.model.collection.collectionName}.getAllByFilter()] Items ${items.length}`
    );

    return items;
  }
};

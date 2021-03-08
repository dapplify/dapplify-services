module.exports = class RequestRunner {
  static run(status, handler) {
    return async function (req, res) {
      try {
        const result = await handler(req, res);

        res
          .status(status || 200)
          .json(RequestRunner.defaultClear(req, res, result));
      } catch (e) {
        console.log(e);

        if (e.status) {
          res.status(e.status).json(e);
        } else {
          res.status(500).json(e);
        }
      }
    };
  }

  static defaultClear(req, res, obj) {
    if (!obj) {
      throw {
        status: 404,
        code: 'NOT_FOUND',
      };
    }

    if (Array.isArray(obj)) {
      if (Object.prototype.hasOwnProperty.call(obj, 'total')) {
        res.set('X-Total-Count', obj.total);
      }

      return obj.map((i) => RequestRunner.defaultClear(req, res, i));
    } else {
      obj.id = obj._id;

      delete obj._id;
      delete obj.__v;
      delete obj.isEnabled;

      return obj;
    }
  }
};

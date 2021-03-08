const mongoose = require('mongoose');

const schema = mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  dapp: {
    uniqueId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
  },
  address: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('events', schema);

const mongoose = require('mongoose');

const schema = mongoose.Schema({
  uniqueId: {
    type: 'String',
    required: true,
  },
  name: {
    type: 'String',
    required: true,
  },
  domain:  {
    type: 'String',
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  jwt: {
    secret: {
      type: String,
      required: true,
    },
    expiresIn: {
      type: String,
      required: true,
    },
  },
  signature: {
    type: String,
    required: true,
  },
  isEnabled: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updateAt: {
    type: Date,
    required: false,
  },
});

module.exports = mongoose.model('dapps', schema);

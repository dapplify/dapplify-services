const mongoose = require('mongoose');

const schema = mongoose.Schema({
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
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  roles: [
    {
      type: String,
      required: true,
    },
  ],
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
  createdBy: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('address', schema);

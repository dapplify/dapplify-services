const mongoose = require('mongoose');

const schema = mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  publicKey: {
    type: String,
    required: true,
  },
  compressedPublicKey: {
    type: String,
    required: true,
  },
  pin: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('users', schema);

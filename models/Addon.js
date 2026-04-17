const { Schema, model } = require('mongoose');

const addonSchema = new Schema({
  name:  { type: String, required: true },
  price: { type: Number, required: true },
});

module.exports = model('Addon', addonSchema);

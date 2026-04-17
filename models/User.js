const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  customerId:      { type: String, required: true, unique: true },
  name:            { type: String, required: true },
  phoneNumber:     { type: String, default: null },
  provider:        { type: String, required: true },
  plan:            { type: String, required: true },
  packPrice:       { type: Number, required: true, default: 0 },
  lastRechargedAt: { type: Date, default: null },
});

module.exports = model('User', userSchema);

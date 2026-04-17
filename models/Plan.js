const { Schema, model } = require('mongoose');

const planSchema = new Schema({
  name:      { type: String, required: true, unique: true },
  packPrice: { type: Number, required: true },
});

module.exports = model('Plan', planSchema);

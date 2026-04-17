const { Schema, model } = require('mongoose');

const channelSchema = new Schema({
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  category: { type: String, default: 'Other' },
});

module.exports = model('Channel', channelSchema);

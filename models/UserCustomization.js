const { Schema, model } = require('mongoose');

const userCustomizationSchema = new Schema({
  userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  planId:     { type: Schema.Types.ObjectId, ref: 'Plan', default: null },
  totalPrice: { type: Number, required: true },
  channels: [{
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel' },
    name:      String,
    price:     Number,
    category:  String,
  }],
  addons: [{
    addonId: { type: Schema.Types.ObjectId, ref: 'Addon' },
    name:    String,
    price:   Number,
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = model('UserCustomization', userCustomizationSchema);

const mongoose = require('mongoose');
const Channel = require('./Channel');
const Addon = require('./Addon');
const Plan = require('./Plan');

const CATEGORY_ORDER = {
  Entertainment: 1, Sports: 2, Movies: 3, News: 4,
  Kids: 5, Regional: 6, Lifestyle: 7, Music: 8, Devotional: 9,
};

async function listChannels() {
  const docs = await Channel.find().lean();
  return docs
    .sort((a, b) => {
      const oa = CATEGORY_ORDER[a.category] ?? 10;
      const ob = CATEGORY_ORDER[b.category] ?? 10;
      if (oa !== ob) return oa - ob;
      return a.name.localeCompare(b.name);
    })
    .map((d) => ({ id: d._id.toString(), name: d.name, price: d.price, category: d.category }));
}

async function listAddons() {
  const docs = await Addon.find().sort({ name: 1 }).lean();
  return docs.map((d) => ({ id: d._id.toString(), name: d.name, price: d.price }));
}

async function listPlans() {
  const docs = await Plan.find().lean();
  return docs.map((d) => ({ id: d._id.toString(), name: d.name, packPrice: d.packPrice }));
}

async function getPlanById(planId) {
  if (!planId || !mongoose.Types.ObjectId.isValid(planId)) return null;
  const doc = await Plan.findById(planId).lean();
  if (!doc) return null;
  return { id: doc._id.toString(), name: doc.name, packPrice: doc.packPrice };
}

module.exports = { listChannels, listAddons, listPlans, getPlanById };

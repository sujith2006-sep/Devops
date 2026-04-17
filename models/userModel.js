const mongoose = require('mongoose');
const User = require('./User');
const UserCustomization = require('./UserCustomization');

function mapUser(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id:              obj._id.toString(),
    customerId:      obj.customerId,
    name:            obj.name,
    provider:        obj.provider,
    plan:            obj.plan,
    packPrice:       obj.packPrice,
    phoneNumber:     obj.phoneNumber ?? null,
    lastRechargedAt: obj.lastRechargedAt ?? null,
  };
}

async function findUserDoc(raw) {
  let doc = await User.findOne({ customerId: raw });
  if (!doc && mongoose.Types.ObjectId.isValid(raw)) {
    doc = await User.findById(raw);
  }
  return doc;
}

const getUserById = async (idParam) => {
  const raw = String(idParam ?? '').trim();
  if (!raw) return null;
  return mapUser(await findUserDoc(raw));
};

const getUserAuthByIdentifier = async (identifier) => {
  return getUserById(identifier);
};

const createUser = async ({ customerId, name, phone, provider, plan, packPrice }) => {
  const doc = await User.create({
    customerId,
    name,
    phoneNumber: phone || null,
    provider,
    plan,
    packPrice,
  });
  return mapUser(doc);
};

const listUsers = async () => {
  const docs = await User.find().sort({ customerId: 1 }).lean();
  return docs.map(mapUser);
};

const deleteUser = async (idParam) => {
  const raw = String(idParam ?? '').trim();
  if (!raw) return false;

  const doc = await findUserDoc(raw);
  if (!doc) return false;

  await UserCustomization.deleteMany({ userId: doc._id });
  await User.deleteOne({ _id: doc._id });
  return true;
};

const getLatestCustomization = async (idParam) => {
  const raw = String(idParam ?? '').trim();
  if (!raw) return null;

  const doc = await findUserDoc(raw);
  if (!doc) return null;

  const cust = await UserCustomization
    .findOne({ userId: doc._id })
    .sort({ createdAt: -1 })
    .lean();

  if (!cust) return null;

  return {
    totalPrice: cust.totalPrice,
    channels: (cust.channels || []).map((c) => ({
      id:       c.channelId?.toString(),
      name:     c.name,
      price:    c.price,
      category: c.category,
    })),
  };
};

const recordRecharge = async (idParam) => {
  const raw = String(idParam ?? '').trim();
  if (!raw) return null;

  const doc = await findUserDoc(raw);
  if (!doc) return null;

  doc.lastRechargedAt = new Date();
  await doc.save();
  return mapUser(doc);
};

module.exports = {
  getUserById,
  getUserAuthByIdentifier,
  createUser,
  listUsers,
  deleteUser,
  getLatestCustomization,
  recordRecharge,
};

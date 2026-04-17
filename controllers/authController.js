const userModel = require('../models/userModel');
const catalogModel = require('../models/catalogModel');

function normalizeRole(role) {
  return String(role ?? '').trim().toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    customerId: user.customerId,
    name: user.name,
    provider: user.provider,
    plan: user.plan,
    packPrice: user.packPrice,
    phoneNumber: user.phoneNumber ?? null,
    lastRechargedAt: user.lastRechargedAt ?? null,
  };
}

const login = async (req, res, next) => {
  try {
    const role = normalizeRole(req.body.role);
    const identifier = String(req.body.identifier ?? '').trim();

    if (!role || !identifier) {
      return res.status(400).json({
        message: '`role` and `identifier` are required',
      });
    }

    if (role === 'admin') {
      const adminIdentifier = process.env.ADMIN_IDENTIFIER || 'admin';

      if (identifier !== adminIdentifier) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      return res.json({
        success: true,
        session: {
          role: 'admin',
          identifier: adminIdentifier,
          displayName: 'Administrator',
        },
      });
    }

    if (role === 'user') {
      const user = await userModel.getUserAuthByIdentifier(identifier);
      if (!user) {
        return res.status(404).json({ message: 'Invalid ID' });
      }

      return res.json({
        success: true,
        session: {
          role: 'user',
          identifier: user.customerId,
          displayName: user.name,
          user: sanitizeUser(user),
        },
      });
    }

    return res.status(400).json({ message: 'Unsupported role selected' });
  } catch (err) {
    return next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const customerId = String(req.body.customerId ?? '').trim();
    const name = String(req.body.name ?? '').trim();
    const phone = String(req.body.phone ?? '').trim();
    const provider = String(req.body.provider ?? '').trim();
    const planId = req.body.planId;

    if (!customerId || !name || !provider || !planId) {
      return res.status(400).json({
        message: '`customerId`, `name`, `provider`, and `planId` are required',
      });
    }

    const existingUser = await userModel.getUserById(customerId);
    if (existingUser) {
      return res.status(409).json({ message: 'ID already exists' });
    }

    const plan = await catalogModel.getPlanById(planId);
    if (!plan) {
      return res.status(400).json({ message: 'Selected plan is invalid' });
    }

    const user = await userModel.createUser({
      customerId,
      name,
      phone,
      provider,
      plan: plan.name,
      packPrice: plan.packPrice,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      session: {
        role: 'user',
        identifier: user.customerId,
        displayName: user.name,
        user,
      },
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'ID already exists' });
    }
    return next(err);
  }
};

const listSubscribers = async (req, res, next) => {
  try {
    const users = await userModel.listUsers();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
};

module.exports = { login, register, listSubscribers };

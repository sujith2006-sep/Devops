const userModel = require('../models/userModel');
const customizationService = require('../services/customizationService');
const { pickCustomizationFields } = require('../utils/helpers');

/**
 * GET /api/user/:id
 * Return user details if exists, otherwise 404.
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await userModel.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/customize
 * Accept id, selected channels, and addons; persist and return saved data.
 */
const customizePlan = async (req, res, next) => {
  try {
    const { id, planId, selectedChannels, addons } = pickCustomizationFields(req.body);

    if (!id) {
      return res.status(400).json({ message: '`id` is required' });
    }

    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const data = await customizationService.saveCustomization({
      user,
      planId,
      selectedChannels,
      addons,
    });

    return res.json({
      success: true,
      message: 'Customization saved successfully.',
      data,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/recharge
 * Stamps last_recharged_at for the user and returns the updated row.
 */
const rechargeUser = async (req, res, next) => {
  try {
    const id = String(req.body.id ?? '').trim();
    if (!id) {
      return res.status(400).json({ message: '`id` is required' });
    }

    const user = await userModel.recordRecharge(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ success: true, lastRechargedAt: user.lastRechargedAt });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/customization/:id
 * Returns the latest saved customization channels for a user.
 */
const getCustomization = async (req, res, next) => {
  try {
    const data = await userModel.getLatestCustomization(req.params.id);
    return res.json({ customization: data ?? null });
  } catch (err) {
    return next(err);
  }
};

/**
 * DELETE /api/user/:id
 * Deletes a subscriber and all their customization data.
 */
const deleteUserById = async (req, res, next) => {
  try {
    const deleted = await userModel.deleteUser(req.params.id)
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.json({ success: true, message: 'Account deleted successfully' })
  } catch (err) {
    return next(err)
  }
}

module.exports = { getUserById, customizePlan, rechargeUser, getCustomization, deleteUserById };

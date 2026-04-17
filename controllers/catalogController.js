const catalogModel = require('../models/catalogModel');

/**
 * GET /api/catalog
 * Returns channels and addons with prices for the UI.
 */
const getCatalog = async (req, res, next) => {
  try {
    const [plans, channels, addons] = await Promise.all([
      catalogModel.listPlans(),
      catalogModel.listChannels(),
      catalogModel.listAddons(),
    ]);
    res.json({ plans, channels, addons });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCatalog };

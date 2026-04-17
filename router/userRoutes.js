const express = require('express');
const router = express.Router();

const { login, register, listSubscribers } = require('../controllers/authController');
const { getUserById, customizePlan, rechargeUser, getCustomization, deleteUserById } = require('../controllers/userController');
const { getCatalog } = require('../controllers/catalogController');

router.post('/auth/login', login);
router.post('/auth/register', register);

router.get('/users', listSubscribers);

// GET: channels + addons with prices
router.get('/catalog', getCatalog);

// GET: return user details by id
router.get('/user/:id', getUserById);

// POST: accept customization selections
router.post('/customize', customizePlan);

// POST: record a recharge and stamp last_recharged_at
router.post('/recharge', rechargeUser);

// GET: latest customization channels for a user
router.get('/customization/:id', getCustomization);

// DELETE: remove a subscriber and all their data (admin only)
router.delete('/user/:id', deleteUserById);

module.exports = router;

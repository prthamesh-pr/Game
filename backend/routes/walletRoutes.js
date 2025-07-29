const express = require('express');
const router = express.Router();
const { addToken, withdraw } = require('../controllers/walletController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Add token to wallet
router.post('/add-token', authMiddleware, addToken);

// Withdraw from wallet
router.post('/withdraw', authMiddleware, withdraw);

module.exports = router;

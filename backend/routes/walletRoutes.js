const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  addToken,
  withdrawToken,
  getWalletBalance,
  getWalletTransactions,
  getWithdrawalRequests
} = require('../controllers/walletController');

/**
 * @route   POST /api/wallet/add-token
 * @desc    Add tokens to wallet
 * @access  Private (User)
 */
router.post('/add-token', authMiddleware, addToken);

/**
 * @route   POST /api/wallet/withdraw
 * @desc    Request withdrawal
 * @access  Private (User)
 */
router.post('/withdraw', authMiddleware, withdrawToken);

/**
 * @route   GET /api/wallet/balance
 * @desc    Get wallet balance
 * @access  Private (User)
 */
router.get('/balance', authMiddleware, getWalletBalance);

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get wallet transactions
 * @access  Private (User)
 */
router.get('/transactions', authMiddleware, getWalletTransactions);

/**
 * @route   GET /api/wallet/withdrawals
 * @desc    Get withdrawal requests
 * @access  Private (User)
 */
router.get('/withdrawals', authMiddleware, getWithdrawalRequests);

module.exports = router;

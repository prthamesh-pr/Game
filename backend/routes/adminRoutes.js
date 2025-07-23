const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware, requirePermission } = require('../middleware/adminMiddleware');
const { validationRules, handleValidationErrors, rateLimiters } = require('../middleware/validation');
const {
  getAllUsers,
  getUserDetails,
  manageUserWallet,
  setGameResult,
  getAllResults,
  getRoundWinners,
  getDashboardStats,
  toggleUserStatus
} = require('../controllers/adminController');

const router = express.Router();

// Apply auth and admin middleware to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);
router.use(rateLimiters.admin);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', [
  requirePermission('canViewReports')
], getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and search
 * @access  Private (Admin)
 */
router.get('/users', [
  requirePermission('canManageUsers'),
  validationRules.pagination,
  handleValidationErrors
], getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user details
 * @access  Private (Admin)
 */
router.get('/users/:id', [
  requirePermission('canManageUsers'),
  validationRules.mongoId,
  handleValidationErrors
], getUserDetails);

/**
 * @route   POST /api/admin/users/:id/toggle-status
 * @desc    Activate/Deactivate user
 * @access  Private (Admin)
 */
router.post('/users/:id/toggle-status', [
  requirePermission('canManageUsers'),
  validationRules.mongoId,
  handleValidationErrors
], toggleUserStatus);

/**
 * @route   POST /api/admin/wallet/manage
 * @desc    Add or deduct money from user wallet
 * @access  Private (Admin)
 */
router.post('/wallet/manage', [
  requirePermission('canManageWallets'),
  validationRules.walletTransaction,
  handleValidationErrors
], manageUserWallet);

/**
 * @route   POST /api/admin/results/set
 * @desc    Set winning numbers for a round
 * @access  Private (Admin)
 */
router.post('/results/set', [
  requirePermission('canSetResults'),
  validationRules.resultSetting,
  handleValidationErrors
], setGameResult);

/**
 * @route   GET /api/admin/results
 * @desc    Get all game results
 * @access  Private (Admin)
 */
router.get('/results', [
  requirePermission('canViewReports'),
  validationRules.pagination,
  handleValidationErrors
], getAllResults);

/**
 * @route   GET /api/admin/results/:roundId/winners
 * @desc    Get winners for a specific round
 * @access  Private (Admin)
 */
router.get('/results/:roundId/winners', [
  requirePermission('canViewReports')
], getRoundWinners);

module.exports = router;

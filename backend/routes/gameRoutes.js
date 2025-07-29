const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const { validationRules, handleValidationErrors, rateLimiters } = require('../middleware/validation');
const { body } = require('express-validator');
const {
  selectNumber,
  getCurrentRound,
  getValidNumbers,
  getGameInfo,
  getRecentResults,
  cancelSelection,
  getCurrentSelections,
  getAllRounds,
  getGameNumbers,
  getUserSelectionHistory
} = require('../controllers/gameController');

/**
 * @route   GET /api/game/selections/history
 * @desc    Get user's selection history
 * @access  Private (User)
 */
router.get('/selections/history', [
  authMiddleware,
  rateLimiters.general,
  validationRules.pagination,
  handleValidationErrors
], getUserSelectionHistory);

/**
 * @route   POST /api/game/select
 * @desc    Select a number for the game
 * @access  Private (User)
 */
router.post('/select', [
  authMiddleware,
  rateLimiters.game,
  validationRules.numberSelection,
  handleValidationErrors
], selectNumber);

/**
 * @route   GET /api/game/current
 * @desc    Get current active round information (alias for /round/current)
 * @access  Public (Optional Auth)
 */
router.get('/current', [
  rateLimiters.general,
  optionalAuth
], getCurrentRound);

/**
 * @route   GET /api/game/rounds/current
 * @desc    Get current active round information (another alias for /round/current)
 * @access  Public (Optional Auth)
 */
router.get('/rounds/current', [
  rateLimiters.general,
  optionalAuth
], getCurrentRound);

/**
 * @route   GET /api/game/rounds
 * @desc    Get all game rounds with pagination
 * @access  Public
 */
router.get('/rounds', [
  rateLimiters.general,
  validationRules.pagination,
  handleValidationErrors
], getAllRounds);

/**
 * @route   GET /api/game/round/current
 * @desc    Get current active round information
 * @access  Public (Optional Auth)
 */
router.get('/round/current', [
  rateLimiters.general,
  optionalAuth
], getCurrentRound);

/**
 * @route   GET /api/game/numbers/:classType
 * @desc    Get valid numbers for a specific class
 * @access  Public
 */
router.get('/numbers/:classType', [
  rateLimiters.general
], getValidNumbers);

/**
 * @route   GET /api/game/numbers
 * @desc    Get list of numbers for a game class
 * @access  Public
 */
router.get('/numbers', getGameNumbers);

/**
 * @route   GET /api/game/info
 * @desc    Get game rules and information
 * @access  Public
 */
router.get('/info', [
  rateLimiters.general
], getGameInfo);

/**
 * @route   GET /api/game/results/recent
 * @desc    Get recent game results
 * @access  Public
 */
router.get('/results/recent', [
  rateLimiters.general,
  validationRules.pagination,
  handleValidationErrors
], getRecentResults);

/**
 * @route   DELETE /api/game/selections/:selectionId
 * @desc    Cancel a number selection (if round is still active)
 * @access  Private (User)
 */
router.delete('/selections/:selectionId', [
  authMiddleware,
  rateLimiters.game,
  validationRules.mongoId,
  handleValidationErrors
], cancelSelection);

/**
 * @route   POST /api/game/cancel
 * @desc    Cancel a number selection by ID in request body (alias for DELETE /selections/:id)
 * @access  Private (User)
 */
router.post('/cancel', [
  authMiddleware,
  rateLimiters.game,
  body('selectionId').isMongoId().withMessage('Invalid selection ID'),
  handleValidationErrors
], (req, res) => {
  // Extract selectionId from body and call cancelSelection
  req.params.selectionId = req.body.selectionId;
  return cancelSelection(req, res);
});

/**
 * @route   GET /api/game/selections/current
 * @desc    Get user's current round selections
 * @access  Private (User)
 */
router.get('/selections/current', [
  authMiddleware,
  rateLimiters.general
], getCurrentSelections);

module.exports = router;

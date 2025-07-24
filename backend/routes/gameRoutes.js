const express = require('express');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const { validationRules, handleValidationErrors, rateLimiters } = require('../middleware/validation');
const {
  selectNumber,
  getCurrentRound,
  getValidNumbers,
  getGameInfo,
  getRecentResults,
  cancelSelection,
  getCurrentSelections,
  getAllRounds
} = require('../controllers/gameController');

const router = express.Router();

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
 * @route   GET /api/game/selections/current
 * @desc    Get user's current round selections
 * @access  Private (User)
 */
router.get('/selections/current', [
  authMiddleware,
  rateLimiters.general
], getCurrentSelections);

module.exports = router;

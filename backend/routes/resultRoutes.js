const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

// GET all results
router.get('/', resultController.getAllResults);

// POST set/update result for a round
router.post('/set', resultController.setResult);

// GET published results
router.get('/published', resultController.getPublishedResults);

module.exports = router;

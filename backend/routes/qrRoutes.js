const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { isAdmin, isAuthenticated } = require('../middleware/authMiddleware');

// Admin uploads/updates QR code
router.post('/upload', isAdmin, qrController.uploadQRCode);
// User fetches current QR code
router.get('/', isAuthenticated, qrController.getQRCode);

module.exports = router;

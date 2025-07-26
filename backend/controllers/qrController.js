const QRCode = require('../models/QRCode');
const Admin = require('../models/Admin');

// Admin uploads/updates QR code
exports.uploadQRCode = async (req, res) => {
  try {
    const { imageData } = req.body;
    const adminId = req.user.id;
    let qr = await QRCode.findOne();
    if (qr) {
      qr.imageData = imageData;
      qr.uploadedBy = adminId;
      qr.updatedAt = new Date();
      await qr.save();
    } else {
      qr = new QRCode({ imageData, uploadedBy: adminId });
      await qr.save();
    }
    res.json({ success: true, message: 'QR code updated', data: qr });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error uploading QR code' });
  }
};

// User fetches current QR code
exports.getQRCode = async (req, res) => {
  try {
    const qr = await QRCode.findOne().sort({ updatedAt: -1 });
    if (!qr) return res.status(404).json({ success: false, message: 'No QR code found' });
    res.json({ success: true, data: qr });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching QR code' });
  }
};

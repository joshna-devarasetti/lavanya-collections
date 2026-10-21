const express = require('express');
const router = express.Router();
const {
  submitCustomRequest,
  getMyCustomRequests,
  getMyCustomRequestDetail,
  respondToQuotation,
  getAdminCustomRequests,
  issueQuotation,
  updateRequestStatus
} = require('../controllers/customRequestController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImage } = require('../services/cloudinaryService');

// Customer endpoints
router.post('/', optionalAuth, submitCustomRequest);
router.get('/my-requests', protect, getMyCustomRequests);
router.get('/my-requests/:id', protect, getMyCustomRequestDetail);
router.post('/:id/respond-quotation', protect, respondToQuotation);

// Helper upload endpoint for reference images
router.post('/upload-reference', optionalAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No reference image uploaded.' });
    }
    const imageUrl = await uploadImage(req.file.path, 'lavanya-collections/custom-requests');
    res.json({ success: true, imageUrl });
  } catch (err) {
    next(err);
  }
});

// Admin endpoints
router.get('/admin/all', protect, adminOnly, getAdminCustomRequests);
router.post('/admin/:id/quotation', protect, adminOnly, issueQuotation);
router.put('/admin/:id/status', protect, adminOnly, updateRequestStatus);

module.exports = router;

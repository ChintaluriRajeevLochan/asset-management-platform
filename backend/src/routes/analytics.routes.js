const router = require('express').Router();
const { getDashboardStats, getMostUsedAssets, getUtilizationByCategory, getBookingTrends } = require('../controllers/analytics.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/stats', authenticate, authorizeAdmin, getDashboardStats);
router.get('/most-used', authenticate, authorizeAdmin, getMostUsedAssets);
router.get('/utilization', authenticate, authorizeAdmin, getUtilizationByCategory);
router.get('/trends', authenticate, authorizeAdmin, getBookingTrends);

module.exports = router;
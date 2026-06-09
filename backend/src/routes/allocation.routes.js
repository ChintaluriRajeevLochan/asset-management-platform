const router = require('express').Router();
const { getActiveAllocations, getOverdueAllocations, returnAsset } = require('../controllers/allocation.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', authenticate, authorizeAdmin, getActiveAllocations);
router.get('/overdue', authenticate, authorizeAdmin, getOverdueAllocations);
router.patch('/:id/return', authenticate, authorizeAdmin, returnAsset);

module.exports = router;
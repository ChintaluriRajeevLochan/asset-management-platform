const router = require('express').Router();
const { getLogs } = require('../controllers/audit.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', authenticate, authorizeAdmin, getLogs);

module.exports = router;
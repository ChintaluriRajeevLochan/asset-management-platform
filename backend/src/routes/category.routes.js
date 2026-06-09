const router = require('express').Router();
const { getAll, create, update, remove } = require('../controllers/category.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', authenticate, getAll);
router.post('/', authenticate, authorizeAdmin, create);
router.put('/:id', authenticate, authorizeAdmin, update);
router.delete('/:id', authenticate, authorizeAdmin, remove);

module.exports = router;
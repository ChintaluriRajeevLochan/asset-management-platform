const router = require('express').Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const db = require('../config/db');

router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/:id/toggle', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, name, is_active',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
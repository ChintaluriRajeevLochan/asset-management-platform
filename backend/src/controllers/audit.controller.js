const db = require('../config/db');

const getLogs = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT al.*, u.name as actor_name, u.email as actor_email
       FROM audit_logs al
       LEFT JOIN users u ON al.actor_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

module.exports = { getLogs };
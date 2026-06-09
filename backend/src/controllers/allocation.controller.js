const db = require('../config/db');
const auditLog = require('../utils/auditLogger');
const { createNotification } = require('../utils/notifications');

const getActiveAllocations = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT al.*, a.name as asset_name, u.name as user_name, u.email as user_email
       FROM asset_allocations al
       JOIN assets a ON al.asset_id = a.id
       JOIN users u ON al.user_id = u.id
       WHERE al.status = 'ACTIVE'
       ORDER BY al.due_date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch allocations' });
  }
};

const getOverdueAllocations = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT al.*, a.name as asset_name, u.name as user_name, u.email as user_email
       FROM asset_allocations al
       JOIN assets a ON al.asset_id = a.id
       JOIN users u ON al.user_id = u.id
       WHERE al.status = 'ACTIVE' AND al.due_date < CURRENT_DATE
       ORDER BY al.due_date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch overdue allocations' });
  }
};

const returnAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { return_condition, return_notes } = req.body;

    const allocRes = await db.query('SELECT * FROM asset_allocations WHERE id = $1', [id]);
    if (allocRes.rows.length === 0) return res.status(404).json({ error: 'Allocation not found' });

    const alloc = allocRes.rows[0];
    if (alloc.status === 'RETURNED') return res.status(400).json({ error: 'Already returned' });

    // Update allocation
    await db.query(
      `UPDATE asset_allocations SET
        status = 'RETURNED', returned_at = NOW(),
        return_condition = $1, return_notes = $2
       WHERE id = $3`,
      [return_condition || 'GOOD', return_notes, id]
    );

    // Restore inventory
    await db.query(
      'UPDATE assets SET available_quantity = available_quantity + $1 WHERE id = $2',
      [alloc.quantity_issued, alloc.asset_id]
    );

    // Log asset health if damaged
    if (return_condition && return_condition !== 'GOOD') {
      await db.query(
        `INSERT INTO asset_health (asset_id, condition, notes, reported_by)
         VALUES ($1, $2, $3, $4)`,
        [alloc.asset_id, return_condition === 'DAMAGED' ? 'FAIR' : 'POOR', return_notes, req.user.id]
      );
    }

    await auditLog(req.user.id, 'ASSET_RETURNED', 'asset_allocations', id, { return_condition });
    await createNotification(alloc.user_id, 'Asset Returned', 'Your asset has been marked as returned.', 'GENERAL');

    res.json({ message: 'Asset returned successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process return' });
  }
};

module.exports = { getActiveAllocations, getOverdueAllocations, returnAsset };
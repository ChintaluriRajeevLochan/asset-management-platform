const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [totalAssets, totalUsers, activeBookings, pendingBookings, overdueAssets, availableAssets] =
      await Promise.all([
        db.query('SELECT COUNT(*) FROM assets'),
        db.query('SELECT COUNT(*) FROM users WHERE role = $1', ['USER']),
        db.query("SELECT COUNT(*) FROM asset_allocations WHERE status = 'ACTIVE'"),
        db.query("SELECT COUNT(*) FROM booking_requests WHERE status = 'PENDING'"),
        db.query("SELECT COUNT(*) FROM asset_allocations WHERE status = 'ACTIVE' AND due_date < CURRENT_DATE"),
        db.query("SELECT COUNT(*) FROM assets WHERE status = 'AVAILABLE'"),
      ]);

    res.json({
      totalAssets: parseInt(totalAssets.rows[0].count),
      totalUsers: parseInt(totalUsers.rows[0].count),
      activeBookings: parseInt(activeBookings.rows[0].count),
      pendingBookings: parseInt(pendingBookings.rows[0].count),
      overdueAssets: parseInt(overdueAssets.rows[0].count),
      availableAssets: parseInt(availableAssets.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

const getMostUsedAssets = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.name, a.id, COUNT(al.id) as booking_count
       FROM assets a
       LEFT JOIN asset_allocations al ON a.id = al.asset_id
       GROUP BY a.id, a.name
       ORDER BY booking_count DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch most used assets' });
  }
};

const getUtilizationByCategory = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.name as category, COUNT(al.id) as total_bookings
       FROM categories c
       LEFT JOIN assets a ON a.category_id = c.id
       LEFT JOIN asset_allocations al ON al.asset_id = a.id
       GROUP BY c.name
       ORDER BY total_bookings DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch utilization' });
  }
};

const getBookingTrends = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as bookings
       FROM booking_requests
       WHERE created_at >= NOW() - INTERVAL '6 months'
       GROUP BY month
       ORDER BY month ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
};

module.exports = { getDashboardStats, getMostUsedAssets, getUtilizationByCategory, getBookingTrends };
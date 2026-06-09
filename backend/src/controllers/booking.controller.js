const db = require('../config/db');
const auditLog = require('../utils/auditLogger');
const { createNotification } = require('../utils/notifications');

const createBooking = async (req, res) => {
  try {
    const { asset_id, quantity_requested, start_date, end_date, purpose } = req.body;
    const user_id = req.user.id;

    if (!asset_id || !quantity_requested || !start_date || !end_date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check availability
    const asset = await db.query('SELECT * FROM assets WHERE id = $1', [asset_id]);
    if (asset.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });

    const a = asset.rows[0];
    if (a.available_quantity < quantity_requested) {
      return res.status(400).json({
        error: `Only ${a.available_quantity} units available`,
      });
    }

    const result = await db.query(
      `INSERT INTO booking_requests
        (user_id, asset_id, quantity_requested, start_date, end_date, purpose)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, asset_id, quantity_requested, start_date, end_date, purpose]
    );

    await auditLog(user_id, 'BOOKING_CREATED', 'booking_requests', result.rows[0].id, { asset_id, quantity_requested });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT br.*, a.name as asset_name, a.image_url, c.name as category_name
       FROM booking_requests br
       JOIN assets a ON br.asset_id = a.id
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE br.user_id = $1
       ORDER BY br.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT br.*, a.name as asset_name, u.name as user_name, u.email as user_email,
             c.name as category_name
      FROM booking_requests br
      JOIN assets a ON br.asset_id = a.id
      JOIN users u ON br.user_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      params.push(status);
      query += ` AND br.status = $${params.length}`;
    }
    query += ' ORDER BY br.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

const reviewBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, admin_remarks } = req.body; // action: APPROVED or REJECTED
    const adminId = req.user.id;

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({ error: 'Action must be APPROVED or REJECTED' });
    }

    const bookingRes = await db.query('SELECT * FROM booking_requests WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const booking = bookingRes.rows[0];
    if (booking.status !== 'PENDING') {
      return res.status(400).json({ error: 'Booking already reviewed' });
    }

    // Update booking status
    await db.query(
      `UPDATE booking_requests SET
        status = $1, admin_remarks = $2, reviewed_by = $3, reviewed_at = NOW()
       WHERE id = $4`,
      [action, admin_remarks, adminId, id]
    );

    if (action === 'APPROVED') {
      // Deduct inventory
      await db.query(
        'UPDATE assets SET available_quantity = available_quantity - $1 WHERE id = $2',
        [booking.quantity_requested, booking.asset_id]
      );

      // Create allocation
      await db.query(
        `INSERT INTO asset_allocations
          (booking_request_id, user_id, asset_id, quantity_issued, due_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, booking.user_id, booking.asset_id, booking.quantity_requested, booking.end_date]
      );

      await createNotification(
        booking.user_id,
        'Booking Approved!',
        `Your booking request has been approved.`,
        'BOOKING_APPROVED'
      );
    } else {
      await createNotification(
        booking.user_id,
        'Booking Rejected',
        `Your booking request was rejected. Reason: ${admin_remarks || 'No reason provided'}`,
        'BOOKING_REJECTED'
      );
    }

    await auditLog(adminId, `BOOKING_${action}`, 'booking_requests', id, { admin_remarks });
    res.json({ message: `Booking ${action.toLowerCase()} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to review booking' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE booking_requests SET status = 'CANCELLED'
       WHERE id = $1 AND user_id = $2 AND status = 'PENDING'
       RETURNING *`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Cannot cancel this booking' });
    }
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

module.exports = { createBooking, getUserBookings, getAllBookings, reviewBooking, cancelBooking };
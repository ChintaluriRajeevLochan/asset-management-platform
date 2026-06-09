const db = require('../config/db');

const createNotification = async (userId, title, message, type) => {
  try {
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)`,
      [userId, title, message, type]
    );
  } catch (err) {
    console.error('Notification error:', err);
  }
};

module.exports = { createNotification };
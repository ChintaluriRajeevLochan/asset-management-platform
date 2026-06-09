const db = require('../config/db');

const auditLog = async (actorId, action, entityType, entityId, details) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [actorId, action, entityType, entityId, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

module.exports = auditLog;
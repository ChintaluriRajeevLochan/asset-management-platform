const db = require('../config/db');
const auditLog = require('../utils/auditLogger');
const QRCode = require('qrcode');

const getAllAssets = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = `
      SELECT a.*, c.name as category_name
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND c.name ILIKE $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND a.name ILIKE $${params.length}`;
    }

    query += ' ORDER BY a.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

const getAssetById = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, c.name as category_name
       FROM assets a
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
};

const createAsset = async (req, res) => {
  try {
    const { name, category_id, description, total_quantity, status } = req.body;

    if (!name || !total_quantity) {
      return res.status(400).json({ error: 'Name and quantity are required' });
    }

    const result = await db.query(
      `INSERT INTO assets (name, category_id, description, total_quantity, available_quantity, status)
       VALUES ($1, $2, $3, $4, $4, $5)
       RETURNING *`,
      [name, category_id, description, total_quantity, status || 'AVAILABLE']
    );

    const asset = result.rows[0];

    // Generate QR code
    const qrData = JSON.stringify({ assetId: asset.id, name: asset.name });
    const qrCode = await QRCode.toDataURL(qrData);
    console.log("QR CODE LENGTH =", qrCode.length);
    await db.query('UPDATE assets SET qr_code = $1 WHERE id = $2', [qrCode, asset.id]);
    asset.qr_code = qrCode;

    await auditLog(req.user.id, 'ASSET_CREATED', 'assets', asset.id, { name });

    res.status(201).json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create asset' });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { name, category_id, description, total_quantity, status } = req.body;
    const { id } = req.params;

    const existing = await db.query('SELECT * FROM assets WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });

    const asset = existing.rows[0];
    const diff = asset.total_quantity - asset.available_quantity; // issued count
    const newAvailable = (total_quantity || asset.total_quantity) - diff;

    if (newAvailable < 0) {
      return res.status(400).json({ error: 'Cannot reduce quantity below currently issued amount' });
    }

    const result = await db.query(
      `UPDATE assets SET
        name = COALESCE($1, name),
        category_id = COALESCE($2, category_id),
        description = COALESCE($3, description),
        total_quantity = COALESCE($4, total_quantity),
        available_quantity = $5,
        status = COALESCE($6, status)
       WHERE id = $7
       RETURNING *`,
      [name, category_id, description, total_quantity, newAvailable, status, id]
    );

    await auditLog(req.user.id, 'ASSET_UPDATED', 'assets', id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update asset' });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
    await auditLog(req.user.id, 'ASSET_DELETED', 'assets', id, { name: result.rows[0].name });
    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete asset' });
  }
};

const getAssetQR = async (req, res) => {
  try {
    const result = await db.query('SELECT qr_code, name FROM assets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch QR code' });
  }
};

module.exports = { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset, getAssetQR };
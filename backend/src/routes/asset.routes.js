const router = require('express').Router();
const { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset, getAssetQR } = require('../controllers/asset.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', authenticate, getAllAssets);
router.get('/:id', authenticate, getAssetById);
router.get('/:id/qr', authenticate, getAssetQR);
router.post('/', authenticate, authorizeAdmin, createAsset);
router.put('/:id', authenticate, authorizeAdmin, updateAsset);
router.delete('/:id', authenticate, authorizeAdmin, deleteAsset);

module.exports = router;
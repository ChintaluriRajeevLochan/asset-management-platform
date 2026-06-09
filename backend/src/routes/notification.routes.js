const router = require('express').Router();

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notification.controller');

const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getMyNotifications);

router.patch('/:id/read', authenticate, markAsRead);

router.patch('/read-all', authenticate, markAllAsRead);

router.delete('/:id', authenticate, deleteNotification);

router.delete('/', authenticate, clearAllNotifications);

module.exports = router;
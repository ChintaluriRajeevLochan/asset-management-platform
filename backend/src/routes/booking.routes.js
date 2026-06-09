const router = require('express').Router();
const { createBooking, getUserBookings, getAllBookings, reviewBooking, cancelBooking } = require('../controllers/booking.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getUserBookings);
router.get('/', authenticate, authorizeAdmin, getAllBookings);
router.patch('/:id/review', authenticate, authorizeAdmin, reviewBooking);
router.patch('/:id/cancel', authenticate, cancelBooking);

module.exports = router;
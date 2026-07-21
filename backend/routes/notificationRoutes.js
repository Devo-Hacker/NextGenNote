const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getNotifications,
  deleteNotification,
  clearAllNotifications,
} = require('../controllers/notificationController');

router.use(protect);
router.get('/', getNotifications);
router.delete('/clear', clearAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
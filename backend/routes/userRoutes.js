const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getMe, updateSettings } = require('../controllers/userController');

router.use(protect);
router.get('/me', getMe);
router.patch('/settings', updateSettings);

module.exports = router;
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { generateNote } = require('../controllers/aiController');

router.use(protect);
router.post('/generate', generateNote);

module.exports = router;
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getWhiteboards, getWhiteboardById, createWhiteboard, updateWhiteboard, deleteWhiteboard,
} = require('../controllers/whiteboardController');

router.use(protect);
router.get('/', getWhiteboards);
router.post('/', createWhiteboard);
router.get('/:id', getWhiteboardById);
router.put('/:id', updateWhiteboard);
router.delete('/:id', deleteWhiteboard);

module.exports = router;
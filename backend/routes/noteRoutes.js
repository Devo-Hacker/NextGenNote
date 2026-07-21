const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createNote,
  getNotes,
  getCounts,
  getNoteById,
  updateNote,
  togglePin,
  archiveNote,
  restoreNote,
  deleteNote,
  hardDeleteNote,
  emptyTrash,
} = require('../controllers/noteController');

router.use(protect);

router.post('/', createNote);
router.get('/', getNotes);
router.get('/counts', getCounts);
router.delete('/trash/empty', emptyTrash);

router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.patch('/:id/pin', togglePin);
router.patch('/:id/archive', archiveNote);
router.patch('/:id/restore', restoreNote);
router.delete('/:id/permanent', hardDeleteNote);
router.delete('/:id', deleteNote);

module.exports = router;
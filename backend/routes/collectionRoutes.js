const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { createCollection, getCollections, deleteCollection } = require('../controllers/collectionController');

router.use(protect);
router.post('/', createCollection);
router.get('/', getCollections);
router.delete('/:id', deleteCollection);

module.exports = router;
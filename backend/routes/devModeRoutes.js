const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getSupportedLanguages,
  createSnippet, getSnippets, getSnippetById, updateSnippet, deleteSnippet,
  detectLanguage, translateCode, generateDiagram,
} = require('../controllers/devModeController');

router.use(protect);

router.get('/languages', getSupportedLanguages);
router.post('/', createSnippet);
router.get('/', getSnippets);
router.get('/:id', getSnippetById);
router.put('/:id', updateSnippet);
router.delete('/:id', deleteSnippet);

router.post('/detect-language', detectLanguage);
router.post('/translate', translateCode);
router.post('/diagram', generateDiagram);

module.exports = router;
const mongoose = require('mongoose');

const codeSnippetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled Snippet', trim: true },
  code: { type: String, default: '' },
  language: { type: String, default: 'plaintext' },
}, { timestamps: true });

module.exports = mongoose.model('CodeSnippet', codeSnippetSchema);
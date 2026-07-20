const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'Untitled',
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
  isAIGenerated: {
    type: Boolean,
    default: false,
  },
  mood: {
    type: String,
    default: null,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
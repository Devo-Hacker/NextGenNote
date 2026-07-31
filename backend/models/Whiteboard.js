const mongoose = require('mongoose');

const whiteboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: 'Untitled Board', trim: true },
  strokes: { type: Array, default: [] }, // array of stroke objects
  boardColor: { type: String, default: 'white' }, // 'white' | 'black'
}, { timestamps: true });

module.exports = mongoose.model('Whiteboard', whiteboardSchema);
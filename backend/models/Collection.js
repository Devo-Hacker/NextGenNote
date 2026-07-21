const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#a855f7' },
}, { timestamps: true });

module.exports = mongoose.model('Collection', collectionSchema);
const Note = require('../models/Note');

// CREATE
exports.createNote = async (req, res) => {
  try {
    const { title, content, isAIGenerated, mood } = req.body;

    const note = await Note.create({
      userId: req.userId,
      title,
      content,
      isAIGenerated: isAIGenerated || false,
      mood: mood || null,
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL (for logged-in user)
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ isPinned: -1, updatedAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET SINGLE
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE
exports.updateNote = async (req, res) => {
  try {
    const { title, content, isPinned } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, content, isPinned },
      { new: true }
    );

    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
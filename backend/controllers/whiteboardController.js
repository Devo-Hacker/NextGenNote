const Whiteboard = require('../models/Whiteboard');

exports.getWhiteboards = async (req, res) => {
  try {
    const boards = await Whiteboard.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.status(200).json(boards);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getWhiteboardById = async (req, res) => {
  try {
    const board = await Whiteboard.findOne({ _id: req.params.id, userId: req.userId });
    if (!board) return res.status(404).json({ message: 'Whiteboard not found' });
    res.status(200).json(board);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createWhiteboard = async (req, res) => {
  try {
    const board = await Whiteboard.create({ userId: req.userId, name: req.body.name || 'Untitled Board' });
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateWhiteboard = async (req, res) => {
  try {
    const { strokes, boardColor, name } = req.body;
    const updateFields = {};
    if (strokes !== undefined) updateFields.strokes = strokes;
    if (boardColor !== undefined) updateFields.boardColor = boardColor;
    if (name !== undefined) updateFields.name = name;

    const board = await Whiteboard.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateFields,
      { new: true }
    );
    if (!board) return res.status(404).json({ message: 'Whiteboard not found' });
    res.status(200).json(board);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteWhiteboard = async (req, res) => {
  try {
    const board = await Whiteboard.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!board) return res.status(404).json({ message: 'Whiteboard not found' });
    res.status(200).json({ message: 'Whiteboard deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
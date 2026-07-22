const Note = require('../models/Note');
const notify = require('../utils/notify');

exports.createNote = async (req, res) => {
  try {
    const { title, content, isAIGenerated, mood, isArchived } = req.body;
    const existingCount = await Note.countDocuments({ userId: req.userId });

    const note = await Note.create({
      userId: req.userId,
      title,
      content,
      isAIGenerated: isAIGenerated || false,
      mood: mood || null,
      isArchived: isArchived || false,
    });

    if (existingCount === 0) {
      await notify(req.userId, 'First note created! 🎉');
    } else {
      await notify(req.userId, 'New note created!');
    }

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const { filter, collectionId } = req.query;
    let query = { userId: req.userId };

    if (collectionId) {
      query = { ...query, collectionId, isDeleted: false, isArchived: false };
    } else if (filter === 'starred') {
      query = { ...query, isPinned: true, isDeleted: false, isArchived: false };
    } else if (filter === 'archive') {
      query = { ...query, isArchived: true, isDeleted: false };
    } else if (filter === 'trash') {
      query = { ...query, isDeleted: true };
    } else {
      query = { ...query, isDeleted: false, isArchived: false };
    }

    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.setNoteCollection = async (req, res) => {
  try {
    const { collectionId } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { collectionId: collectionId || null },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getCounts = async (req, res) => {
  try {
    const userId = req.userId;
    const [starred, archive, trash] = await Promise.all([
      Note.countDocuments({ userId, isPinned: true, isDeleted: false, isArchived: false }),
      Note.countDocuments({ userId, isArchived: true, isDeleted: false }),
      Note.countDocuments({ userId, isDeleted: true }),
    ]);
    res.status(200).json({ starred, archive, trash });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateFields,
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    note.isPinned = !note.isPinned;
    await note.save();

    if (note.isPinned) {
      await notify(req.userId, 'You pinned a note!');
    }

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.archiveNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isArchived: true, isPinned: false },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await notify(req.userId, 'You archived a note!');

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.restoreNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isArchived: false, isDeleted: false },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isDeleted: true, isPinned: false },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await notify(req.userId, 'You deleted a note!');

    res.status(200).json({ message: 'Note moved to trash' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.hardDeleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId, isDeleted: true });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json({ message: 'Note permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.emptyTrash = async (req, res) => {
  try {
    await Note.deleteMany({ userId: req.userId, isDeleted: true });
    await notify(req.userId, 'You deleted all notes!');
    res.status(200).json({ message: 'Trash emptied' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getGraphData = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId, isDeleted: false })
      .select('title collectionId linkedNotes isAIGenerated mood');

    const nodes = notes.map((n) => ({
      id: n._id,
      title: n.title || 'Untitled',
      collectionId: n.collectionId,
      isAIGenerated: n.isAIGenerated,
    }));

    const edgeSet = new Set();
    const edges = [];
    notes.forEach((n) => {
      n.linkedNotes.forEach((targetId) => {
        const key = [n._id.toString(), targetId.toString()].sort().join('-');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: n._id, target: targetId });
        }
      });
    });

    res.status(200).json({ nodes, edges });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.toggleLink = async (req, res) => {
  try {
    const { targetId } = req.body;
    if (!targetId) return res.status(400).json({ message: 'targetId is required' });

    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    const target = await Note.findOne({ _id: targetId, userId: req.userId });
    if (!note || !target) return res.status(404).json({ message: 'Note not found' });

    const alreadyLinked = note.linkedNotes.some((id) => id.toString() === targetId);

    if (alreadyLinked) {
      note.linkedNotes = note.linkedNotes.filter((id) => id.toString() !== targetId);
      target.linkedNotes = target.linkedNotes.filter((id) => id.toString() !== req.params.id);
    } else {
      note.linkedNotes.push(targetId);
      target.linkedNotes.push(req.params.id);
    }

    await note.save();
    await target.save();

    res.status(200).json({ linked: !alreadyLinked, note });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
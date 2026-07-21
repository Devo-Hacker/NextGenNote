const Collection = require('../models/Collection');
const Note = require('../models/Note');
const notify = require('../utils/notify');

exports.createCollection = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const collection = await Collection.create({
      userId: req.userId,
      name,
      color: color || '#a855f7',
    });

    await notify(req.userId, `You made a collection "${name}"!`);

    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ userId: req.userId }).sort({ createdAt: 1 });
    res.status(200).json(collections);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    await Note.updateMany({ collectionId: req.params.id, userId: req.userId }, { collectionId: null });

    await notify(req.userId, `You deleted a collection!`);

    res.status(200).json({ message: 'Collection deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
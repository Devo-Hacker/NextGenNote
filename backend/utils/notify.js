const Notification = require('../models/Notification');

const notify = async (userId, message) => {
  try {
    await Notification.create({ userId, message });
  } catch (err) {
    console.error('Failed to create notification', err);
  }
};

module.exports = notify;
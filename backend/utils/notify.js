const Notification = require('../models/Notification');
const User = require('../models/User');

const notify = async (userId, message) => {
  try {
    const user = await User.findById(userId).select('notificationsEnabled');
    if (user && user.notificationsEnabled === false) return;
    await Notification.create({ userId, message });
  } catch (err) {
    console.error('Failed to create notification', err);
  }
};

module.exports = notify;
const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { name, avatar, darkMode, notificationsEnabled, dashboardGreeting } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (darkMode !== undefined) updateFields.darkMode = darkMode;
    if (notificationsEnabled !== undefined) updateFields.notificationsEnabled = notificationsEnabled;
    if (dashboardGreeting !== undefined) updateFields.dashboardGreeting = dashboardGreeting;

    const user = await User.findByIdAndUpdate(req.userId, updateFields, { new: true }).select('-password');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
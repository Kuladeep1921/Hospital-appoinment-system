const Notification = require('../models/Notification');

// GET /api/notifications — get notifications for logged-in user
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user._id, read: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching count' });
    }
};

// PATCH /api/notifications/mark-read — mark all as read
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error marking notifications read' });
    }
};

module.exports = { getNotifications, getUnreadCount, markAllRead };

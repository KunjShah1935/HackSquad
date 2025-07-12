import express from 'express';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';
import { validate, validateQuery, validateParams, notificationSchemas, querySchemas } from '../middleware/validation.js';

const router = express.Router();

// Get current user's notifications
router.get('/', authenticate, validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { page = 1, limit = 20, read, type } = req.query;
    const userId = req.user._id;
    
    const query = { recipient: userId };
    
    // Filter by read status
    if (read !== undefined) {
      query.read = read === 'true';
    }
    
    // Filter by type
    if (type) {
      query.type = type;
    }
    
    const result = await Notification.getUserNotifications(userId, page, limit);
    
    res.json({
      notifications: result.notifications,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      message: 'Failed to get notifications',
      error: error.message
    });
  }
});

// Get unread notification count
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.getUnreadCount(userId);
    
    res.json({
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      message: 'Failed to get unread count',
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found'
      });
    }
    
    if (!notification.read) {
      await notification.markAsRead();
    }
    
    res.json({
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Mark multiple notifications as read
router.put('/read/bulk', authenticate, validate(notificationSchemas.markAsRead), async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user._id;
    
    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: userId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );
    
    res.json({
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json({
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
});

// Mark all notifications as read
router.put('/read/all', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.markAllAsRead(userId);
    
    res.json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// Delete a notification
router.delete('/:id', authenticate, validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found'
      });
    }
    
    await notification.deleteOne();
    
    res.json({
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

// Delete multiple notifications
router.delete('/bulk', authenticate, validate(notificationSchemas.markAsRead), async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user._id;
    
    await Notification.deleteMany({
      _id: { $in: notificationIds },
      recipient: userId
    });
    
    res.json({
      message: 'Notifications deleted'
    });
  } catch (error) {
    console.error('Delete notifications error:', error);
    res.status(500).json({
      message: 'Failed to delete notifications',
      error: error.message
    });
  }
});

// Delete all read notifications
router.delete('/read/all', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.deleteMany({
      recipient: userId,
      read: true
    });
    
    res.json({
      message: 'All read notifications deleted'
    });
  } catch (error) {
    console.error('Delete all read notifications error:', error);
    res.status(500).json({
      message: 'Failed to delete all read notifications',
      error: error.message
    });
  }
});

// Get notification preferences
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      preferences: user.preferences || {
        emailNotifications: true,
        pushNotifications: true,
        questionAnswered: true,
        answerVoted: true,
        questionVoted: true,
        answerAccepted: true,
        newFollower: true,
        mentions: true,
        systemAnnouncements: true
      }
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      message: 'Failed to get notification preferences',
      error: error.message
    });
  }
});

// Update notification preferences
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;
    
    user.preferences = {
      ...user.preferences,
      ...updates
    };
    
    await user.save();
    
    res.json({
      message: 'Notification preferences updated',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
});

// Get notification statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [
      totalNotifications,
      unreadNotifications,
      readNotifications,
      notificationsByType
    ] = await Promise.all([
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, read: false }),
      Notification.countDocuments({ recipient: userId, read: true }),
      Notification.aggregate([
        { $match: { recipient: userId } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);
    
    res.json({
      stats: {
        total: totalNotifications,
        unread: unreadNotifications,
        read: readNotifications,
        byType: notificationsByType.map(item => ({
          type: item._id,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      message: 'Failed to get notification statistics',
      error: error.message
    });
  }
});

// Create a test notification (for development/testing)
router.post('/test', authenticate, async (req, res) => {
  try {
    const { title, message, type = 'system_announcement' } = req.body;
    const userId = req.user._id;
    
    const notification = new Notification({
      recipient: userId,
      sender: userId,
      type,
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      priority: 'medium'
    });
    
    await notification.save();
    
    res.json({
      message: 'Test notification created',
      notification
    });
  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      message: 'Failed to create test notification',
      error: error.message
    });
  }
});

export default router;
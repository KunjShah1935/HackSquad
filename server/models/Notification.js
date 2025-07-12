import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'question_answered',
      'answer_voted',
      'question_voted',
      'answer_accepted',
      'question_commented',
      'answer_commented',
      'new_follower',
      'mention',
      'bounty_awarded',
      'badge_earned',
      'system_announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  // Reference to the related content
  relatedQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  relatedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Notification status
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Action URL for frontend routing
  actionUrl: String,
  // Metadata for complex notifications
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Delivery status
  delivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  // Email notification
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  // Expiration for temporary notifications
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ sender: 1 });

// Instance methods
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  await this.save();
  return this;
};

notificationSchema.methods.markAsDelivered = async function() {
  this.delivered = true;
  this.deliveredAt = new Date();
  await this.save();
  return this;
};

notificationSchema.methods.markEmailSent = async function() {
  this.emailSent = true;
  this.emailSentAt = new Date();
  await this.save();
  return this;
};

// Static methods
notificationSchema.statics.createQuestionAnswered = async function(questionId, answerId, questionAuthor, answerAuthor) {
  const notification = new this({
    recipient: questionAuthor,
    sender: answerAuthor,
    type: 'question_answered',
    title: 'New Answer to Your Question',
    message: `${answerAuthor.username} answered your question`,
    relatedQuestion: questionId,
    relatedAnswer: answerId,
    actionUrl: `/questions/${questionId}#answer-${answerId}`
  });
  
  return await notification.save();
};

notificationSchema.statics.createAnswerVoted = async function(answerId, answerAuthor, voter, voteType) {
  const voteText = voteType === 'up' ? 'upvoted' : 'downvoted';
  const notification = new this({
    recipient: answerAuthor,
    sender: voter,
    type: 'answer_voted',
    title: `Answer ${voteText.charAt(0).toUpperCase() + voteText.slice(1)}`,
    message: `${voter.username} ${voteText} your answer`,
    relatedAnswer: answerId,
    metadata: { voteType }
  });
  
  return await notification.save();
};

notificationSchema.statics.createQuestionVoted = async function(questionId, questionAuthor, voter, voteType) {
  const voteText = voteType === 'up' ? 'upvoted' : 'downvoted';
  const notification = new this({
    recipient: questionAuthor,
    sender: voter,
    type: 'question_voted',
    title: `Question ${voteText.charAt(0).toUpperCase() + voteText.slice(1)}`,
    message: `${voter.username} ${voteText} your question`,
    relatedQuestion: questionId,
    metadata: { voteType }
  });
  
  return await notification.save();
};

notificationSchema.statics.createAnswerAccepted = async function(answerId, answerAuthor, questionAuthor) {
  const notification = new this({
    recipient: answerAuthor,
    sender: questionAuthor,
    type: 'answer_accepted',
    title: 'Answer Accepted!',
    message: `${questionAuthor.username} accepted your answer`,
    relatedAnswer: answerId,
    priority: 'high'
  });
  
  return await notification.save();
};

notificationSchema.statics.createBadgeEarned = async function(userId, badgeName, badgeDescription) {
  const notification = new this({
    recipient: userId,
    sender: userId, // System notification
    type: 'badge_earned',
    title: 'Badge Earned!',
    message: `You earned the "${badgeName}" badge: ${badgeDescription}`,
    priority: 'high',
    metadata: { badgeName, badgeDescription }
  });
  
  return await notification.save();
};

notificationSchema.statics.createSystemAnnouncement = async function(title, message, recipients = []) {
  const notifications = [];
  
  if (recipients.length === 0) {
    // Send to all users
    const User = mongoose.model('User');
    const users = await User.find({ isActive: true }).select('_id');
    recipients = users.map(user => user._id);
  }
  
  for (const recipientId of recipients) {
    const notification = new this({
      recipient: recipientId,
      sender: recipientId, // System notification
      type: 'system_announcement',
      title,
      message,
      priority: 'high'
    });
    
    notifications.push(await notification.save());
  }
  
  return notifications;
};

notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    recipient: userId,
    read: false
  });
};

notificationSchema.statics.getUserNotifications = async function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const notifications = await this.find({ recipient: userId })
    .populate('sender', 'username avatar')
    .populate('relatedQuestion', 'title slug')
    .populate('relatedAnswer', 'content')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await this.countDocuments({ recipient: userId });
  
  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  await this.updateMany(
    { recipient: userId, read: false },
    { read: true, readAt: new Date() }
  );
};

notificationSchema.statics.deleteOldNotifications = async function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    read: true
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
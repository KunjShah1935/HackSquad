import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 10000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  // Track who voted to prevent duplicate votes
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Answer status
  isAccepted: {
    type: Boolean,
    default: false
  },
  // Answer quality/helpful count
  helpfulCount: {
    type: Number,
    default: 0
  },
  // Moderation
  reportCount: {
    type: Number,
    default: 0
  },
  isReported: {
    type: Boolean,
    default: false
  },
  // Edit history
  editHistory: [{
    editedAt: Date,
    reason: String,
    previousContent: String
  }],
  // Last edit tracking
  lastEditedAt: Date,
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ author: 1 });
answerSchema.index({ votes: -1 });
answerSchema.index({ isAccepted: 1 });
answerSchema.index({ createdAt: -1 });

// Update question's answer count and last activity
answerSchema.post('save', async function(doc) {
  const Question = mongoose.model('Question');
  
  // Update question's answer count and last activity
  await Question.findByIdAndUpdate(doc.question, {
    $inc: { answerCount: 1 },
    lastActivity: new Date()
  });
});

// Update question's answer count when answer is removed
answerSchema.post('deleteOne', { document: true }, async function(doc) {
  const Question = mongoose.model('Question');
  
  // Update question's answer count
  await Question.findByIdAndUpdate(doc.question, {
    $inc: { answerCount: -1 }
  });
});

// Instance methods
answerSchema.methods.upvote = async function(userId) {
  const User = mongoose.model('User');
  
  // Remove from downvotes if exists
  this.downvotes.pull(userId);
  
  // Add to upvotes if not already there
  if (!this.upvotes.includes(userId)) {
    this.upvotes.push(userId);
    
    // Update author's reputation
    await User.findByIdAndUpdate(this.author, {
      $inc: { reputation: 10 }
    });
  }
  
  // Update vote count
  this.votes = this.upvotes.length - this.downvotes.length;
  await this.save();
  
  return this;
};

answerSchema.methods.downvote = async function(userId) {
  const User = mongoose.model('User');
  
  // Remove from upvotes if exists
  this.upvotes.pull(userId);
  
  // Add to downvotes if not already there
  if (!this.downvotes.includes(userId)) {
    this.downvotes.push(userId);
    
    // Update author's reputation
    await User.findByIdAndUpdate(this.author, {
      $inc: { reputation: -2 }
    });
  }
  
  // Update vote count
  this.votes = this.upvotes.length - this.downvotes.length;
  await this.save();
  
  return this;
};

answerSchema.methods.removeVote = async function(userId) {
  const hadUpvote = this.upvotes.includes(userId);
  const hadDownvote = this.downvotes.includes(userId);
  
  this.upvotes.pull(userId);
  this.downvotes.pull(userId);
  
  // Update author's reputation
  if (hadUpvote || hadDownvote) {
    const User = mongoose.model('User');
    const reputationChange = hadUpvote ? -10 : 2;
    await User.findByIdAndUpdate(this.author, {
      $inc: { reputation: reputationChange }
    });
  }
  
  // Update vote count
  this.votes = this.upvotes.length - this.downvotes.length;
  await this.save();
  
  return this;
};

answerSchema.methods.markAsAccepted = async function() {
  const Question = mongoose.model('Question');
  const User = mongoose.model('User');
  
  // Remove accepted status from other answers to this question
  await Answer.updateMany(
    { question: this.question, _id: { $ne: this._id } },
    { isAccepted: false }
  );
  
  // Mark this answer as accepted
  this.isAccepted = true;
  await this.save();
  
  // Update question
  await Question.findByIdAndUpdate(this.question, {
    hasAcceptedAnswer: true,
    acceptedAnswer: this._id
  });
  
  // Award reputation to answer author
  await User.findByIdAndUpdate(this.author, {
    $inc: { reputation: 15 }
  });
  
  return this;
};

answerSchema.methods.markAsHelpful = async function() {
  this.helpfulCount += 1;
  await this.save();
  return this;
};

answerSchema.methods.addEdit = async function(editedBy, reason, previousContent) {
  this.editHistory.push({
    editedAt: new Date(),
    reason,
    previousContent
  });
  
  this.lastEditedAt = new Date();
  this.lastEditedBy = editedBy;
  
  await this.save();
  return this;
};

// Static methods
answerSchema.statics.findByQuestion = function(questionId) {
  return this.find({ question: questionId })
    .populate('author', 'username avatar reputation')
    .sort({ isAccepted: -1, votes: -1, createdAt: -1 });
};

answerSchema.statics.findTopByUser = function(userId, limit = 10) {
  return this.find({ author: userId })
    .populate('question', 'title slug')
    .sort({ votes: -1, createdAt: -1 })
    .limit(limit);
};

answerSchema.statics.findAcceptedByUser = function(userId) {
  return this.find({ author: userId, isAccepted: true })
    .populate('question', 'title slug')
    .sort({ createdAt: -1 });
};

const Answer = mongoose.model('Answer', answerSchema);

export default Answer;
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 300
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 20,
    maxlength: 5000
  },
  tags: [{
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 50
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  // Answer count for quick access
  answerCount: {
    type: Number,
    default: 0
  },
  // Track if question has accepted answer
  hasAcceptedAnswer: {
    type: Boolean,
    default: false
  },
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  // View count
  views: {
    type: Number,
    default: 0
  },
  // Question status
  status: {
    type: String,
    enum: ['open', 'closed', 'deleted'],
    default: 'open'
  },
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  // Priority/featured
  isPinned: {
    type: Boolean,
    default: false
  },
  // Bounty system
  bounty: {
    amount: {
      type: Number,
      default: 0
    },
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: false
    }
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
  // SEO-friendly slug
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  // Last activity for sorting
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
questionSchema.index({ title: 'text', description: 'text' });
questionSchema.index({ tags: 1 });
questionSchema.index({ author: 1 });
questionSchema.index({ votes: -1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ lastActivity: -1 });
questionSchema.index({ status: 1 });
questionSchema.index({ views: -1 });
questionSchema.index({ slug: 1 });

// Generate slug from title
questionSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
    
    // Add timestamp to ensure uniqueness
    this.slug += '-' + Date.now();
  }
  next();
});

// Update last activity when question is modified
questionSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastActivity = new Date();
  }
  next();
});

// Virtual for answers
questionSchema.virtual('answers', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question'
});

// Ensure virtual fields are serialized
questionSchema.set('toJSON', { virtuals: true });
questionSchema.set('toObject', { virtuals: true });

// Instance methods
questionSchema.methods.upvote = async function(userId) {
  const User = mongoose.model('User');
  
  // Remove from downvotes if exists
  this.downvotes.pull(userId);
  
  // Add to upvotes if not already there
  if (!this.upvotes.includes(userId)) {
    this.upvotes.push(userId);
    
    // Update author's reputation
    await User.findByIdAndUpdate(this.author, {
      $inc: { reputation: 5 }
    });
  }
  
  // Update vote count
  this.votes = this.upvotes.length - this.downvotes.length;
  await this.save();
  
  return this;
};

questionSchema.methods.downvote = async function(userId) {
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

questionSchema.methods.removeVote = async function(userId) {
  const hadUpvote = this.upvotes.includes(userId);
  const hadDownvote = this.downvotes.includes(userId);
  
  this.upvotes.pull(userId);
  this.downvotes.pull(userId);
  
  // Update author's reputation
  if (hadUpvote || hadDownvote) {
    const User = mongoose.model('User');
    const reputationChange = hadUpvote ? -5 : 2;
    await User.findByIdAndUpdate(this.author, {
      $inc: { reputation: reputationChange }
    });
  }
  
  // Update vote count
  this.votes = this.upvotes.length - this.downvotes.length;
  await this.save();
  
  return this;
};

questionSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
  return this;
};

questionSchema.methods.acceptAnswer = async function(answerId) {
  const Answer = mongoose.model('Answer');
  
  // Remove accepted status from previous answer
  if (this.acceptedAnswer) {
    await Answer.findByIdAndUpdate(this.acceptedAnswer, {
      isAccepted: false
    });
  }
  
  // Set new accepted answer
  this.acceptedAnswer = answerId;
  this.hasAcceptedAnswer = true;
  
  // Update the answer
  await Answer.findByIdAndUpdate(answerId, {
    isAccepted: true
  });
  
  await this.save();
  return this;
};

// Static methods
questionSchema.statics.findByTag = function(tag) {
  return this.find({ tags: tag, status: 'open' });
};

questionSchema.statics.findSimilar = function(title, tags) {
  return this.find({
    $or: [
      { title: { $regex: title, $options: 'i' } },
      { tags: { $in: tags } }
    ],
    status: 'open'
  }).limit(5);
};

questionSchema.statics.getTrending = function() {
  return this.find({ status: 'open' })
    .sort({ votes: -1, views: -1, createdAt: -1 })
    .limit(10);
};

const Question = mongoose.model('Question', questionSchema);

export default Question;
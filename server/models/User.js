import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  reputation: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Statistics
  stats: {
    questionsAsked: {
      type: Number,
      default: 0
    },
    answersGiven: {
      type: Number,
      default: 0
    },
    questionsUpvoted: {
      type: Number,
      default: 0
    },
    answersUpvoted: {
      type: Number,
      default: 0
    },
    totalVotesReceived: {
      type: Number,
      default: 0
    }
  },
  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  // Social links
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    website: String
  },
  // Account metadata
  refreshToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ reputation: -1 });
userSchema.index({ 'stats.questionsAsked': -1 });
userSchema.index({ 'stats.answersGiven': -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate display name
userSchema.methods.getDisplayName = function() {
  return this.username;
};

// Get user stats
userSchema.methods.getStats = function() {
  return {
    questionsAsked: this.stats.questionsAsked,
    answersGiven: this.stats.answersGiven,
    totalVotesReceived: this.stats.totalVotesReceived,
    reputation: this.reputation
  };
};

// Update user stats
userSchema.methods.updateStats = async function(statType, increment = 1) {
  const validStats = ['questionsAsked', 'answersGiven', 'questionsUpvoted', 'answersUpvoted', 'totalVotesReceived'];
  
  if (validStats.includes(statType)) {
    this.stats[statType] += increment;
    await this.save();
  }
};

// Remove sensitive data from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
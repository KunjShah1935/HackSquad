import express from 'express';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate, validateQuery, validateParams, userSchemas, querySchemas } from '../middleware/validation.js';

const router = express.Router();

// Get all users with pagination and search
router.get('/', validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'reputation', order = 'desc', q } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { isActive: true };
    
    // Add search functionality
    if (q) {
      query.$or = [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Build sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('username avatar reputation bio stats createdAt')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);
    
    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// Get a single user by ID or username
router.get('/:identifier', optionalAuth, async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is ObjectId or username
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isObjectId ? { _id: identifier } : { username: identifier };
    
    const user = await User.findOne(query)
      .select('username avatar reputation bio stats socialLinks createdAt preferences');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    // Get user's activity summary
    const [questionsCount, answersCount, acceptedAnswersCount] = await Promise.all([
      Question.countDocuments({ author: user._id, status: 'open' }),
      Answer.countDocuments({ author: user._id }),
      Answer.countDocuments({ author: user._id, isAccepted: true })
    ]);
    
    // Get recent activity
    const [recentQuestions, recentAnswers] = await Promise.all([
      Question.find({ author: user._id, status: 'open' })
        .select('title slug votes views createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      Answer.find({ author: user._id })
        .populate('question', 'title slug')
        .select('votes isAccepted createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);
    
    res.json({
      user,
      activity: {
        questionsCount,
        answersCount,
        acceptedAnswersCount,
        recentQuestions,
        recentAnswers
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Failed to get user',
      error: error.message
    });
  }
});

// Update user profile
router.put('/:id', authenticate, validateParams(querySchemas.objectId), validate(userSchemas.updateProfile), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Users can only update their own profile
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        message: 'You can only update your own profile'
      });
    }
    
    // Check if username is being updated and is available
    if (updates.username && updates.username !== req.user.username) {
      const existingUser = await User.findOne({ username: updates.username });
      if (existingUser) {
        return res.status(400).json({
          message: 'Username already taken'
        });
      }
    }
    
    // Update user fields
    Object.keys(updates).forEach(key => {
      if (key === 'preferences' || key === 'socialLinks') {
        req.user[key] = { ...req.user[key], ...updates[key] };
      } else {
        req.user[key] = updates[key];
      }
    });
    
    await req.user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar,
        bio: req.user.bio,
        reputation: req.user.reputation,
        stats: req.user.stats,
        socialLinks: req.user.socialLinks,
        preferences: req.user.preferences
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Get user's questions
router.get('/:id/questions', validateParams(querySchemas.objectId), validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const [questions, total] = await Promise.all([
      Question.find({ author: id, status: 'open' })
        .select('title slug votes views answerCount createdAt tags')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Question.countDocuments({ author: id, status: 'open' })
    ]);
    
    res.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user questions error:', error);
    res.status(500).json({
      message: 'Failed to get user questions',
      error: error.message
    });
  }
});

// Get user's answers
router.get('/:id/answers', validateParams(querySchemas.objectId), validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const [answers, total] = await Promise.all([
      Answer.find({ author: id })
        .populate('question', 'title slug')
        .select('content votes isAccepted helpfulCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Answer.countDocuments({ author: id })
    ]);
    
    res.json({
      answers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user answers error:', error);
    res.status(500).json({
      message: 'Failed to get user answers',
      error: error.message
    });
  }
});

// Get top users (leaderboard)
router.get('/top/reputation', validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find({ isActive: true })
        .select('username avatar reputation stats createdAt')
        .sort({ reputation: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ isActive: true })
    ]);
    
    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      ...user.toObject(),
      rank: skip + index + 1
    }));
    
    res.json({
      users: leaderboard,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get top users error:', error);
    res.status(500).json({
      message: 'Failed to get top users',
      error: error.message
    });
  }
});

// Get new users
router.get('/new/recent', validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find({ isActive: true })
        .select('username avatar reputation stats createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ isActive: true })
    ]);
    
    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get new users error:', error);
    res.status(500).json({
      message: 'Failed to get new users',
      error: error.message
    });
  }
});

// Search users
router.get('/search/:query', validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const searchQuery = {
      isActive: true,
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ]
    };
    
    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select('username avatar reputation bio stats')
        .sort({ reputation: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(searchQuery)
    ]);
    
    res.json({
      users,
      query,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      message: 'Failed to search users',
      error: error.message
    });
  }
});

// Get user badges/achievements (placeholder for future implementation)
router.get('/:id/badges', validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    // Placeholder badges based on user stats
    const badges = [];
    
    if (user.stats.questionsAsked >= 10) {
      badges.push({
        name: 'Inquisitive',
        description: 'Asked 10+ questions',
        type: 'bronze',
        earnedAt: user.createdAt
      });
    }
    
    if (user.stats.answersGiven >= 10) {
      badges.push({
        name: 'Helpful',
        description: 'Provided 10+ answers',
        type: 'bronze',
        earnedAt: user.createdAt
      });
    }
    
    if (user.reputation >= 100) {
      badges.push({
        name: 'Reputable',
        description: 'Earned 100+ reputation',
        type: 'bronze',
        earnedAt: user.createdAt
      });
    }
    
    if (user.reputation >= 1000) {
      badges.push({
        name: 'Trusted',
        description: 'Earned 1000+ reputation',
        type: 'silver',
        earnedAt: user.createdAt
      });
    }
    
    if (user.reputation >= 10000) {
      badges.push({
        name: 'Expert',
        description: 'Earned 10000+ reputation',
        type: 'gold',
        earnedAt: user.createdAt
      });
    }
    
    res.json({
      badges
    });
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({
      message: 'Failed to get user badges',
      error: error.message
    });
  }
});

export default router;
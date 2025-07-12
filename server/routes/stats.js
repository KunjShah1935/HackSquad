import express from 'express';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Notification from '../models/Notification.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateQuery, querySchemas } from '../middleware/validation.js';

const router = express.Router();

// Get system-wide statistics
router.get('/system', async (req, res) => {
  try {
    const [
      totalUsers,
      totalQuestions,
      totalAnswers,
      totalVotes,
      questionsToday,
      answersToday,
      newUsersToday,
      activeUsersToday
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Question.countDocuments({ status: 'open' }),
      Answer.countDocuments(),
      Question.aggregate([
        { $group: { _id: null, totalVotes: { $sum: '$votes' } } }
      ]).then(result => result[0]?.totalVotes || 0),
      Question.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Answer.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      User.countDocuments({
        lastLogin: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
    ]);

    // Get trending tags
    const trendingTags = await Question.aggregate([
      { $match: { status: 'open' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get top users by reputation
    const topUsers = await User.find({ isActive: true })
      .select('username avatar reputation stats')
      .sort({ reputation: -1 })
      .limit(10);

    // Get recent activity
    const recentActivity = await Question.find({ status: 'open' })
      .populate('author', 'username avatar')
      .select('title slug createdAt lastActivity')
      .sort({ lastActivity: -1 })
      .limit(10);

    res.json({
      system: {
        totalUsers,
        totalQuestions,
        totalAnswers,
        totalVotes,
        questionsToday,
        answersToday,
        newUsersToday,
        activeUsersToday
      },
      trendingTags: trendingTags.map(tag => ({
        name: tag._id,
        count: tag.count
      })),
      topUsers,
      recentActivity
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      message: 'Failed to get system statistics',
      error: error.message
    });
  }
});

// Get user statistics
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('username avatar reputation stats createdAt');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const [
      questionsAsked,
      answersGiven,
      totalVotesReceived,
      acceptedAnswers,
      topQuestions,
      topAnswers,
      recentActivity
    ] = await Promise.all([
      Question.countDocuments({ author: userId, status: 'open' }),
      Answer.countDocuments({ author: userId }),
      Question.aggregate([
        { $match: { author: userId } },
        { $group: { _id: null, totalVotes: { $sum: '$votes' } } }
      ]).then(result => result[0]?.totalVotes || 0),
      Answer.countDocuments({ author: userId, isAccepted: true }),
      Question.find({ author: userId, status: 'open' })
        .select('title slug votes views createdAt')
        .sort({ votes: -1 })
        .limit(5),
      Answer.find({ author: userId })
        .populate('question', 'title slug')
        .select('votes isAccepted createdAt')
        .sort({ votes: -1 })
        .limit(5),
      Question.find({ author: userId, status: 'open' })
        .select('title slug createdAt lastActivity')
        .sort({ lastActivity: -1 })
        .limit(10)
    ]);

    // Calculate reputation breakdown
    const reputationBreakdown = {
      questionVotes: 0,
      answerVotes: 0,
      acceptedAnswers: acceptedAnswers * 15,
      other: 0
    };

    res.json({
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        reputation: user.reputation,
        memberSince: user.createdAt
      },
      stats: {
        questionsAsked,
        answersGiven,
        totalVotesReceived,
        acceptedAnswers,
        ...user.stats
      },
      reputationBreakdown,
      topQuestions,
      topAnswers,
      recentActivity
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      message: 'Failed to get user statistics',
      error: error.message
    });
  }
});

// Get current user's detailed statistics
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user;

    const [
      questionsAsked,
      answersGiven,
      totalVotesReceived,
      acceptedAnswers,
      notificationCount,
      unreadNotifications,
      topQuestions,
      topAnswers,
      recentActivity,
      monthlyActivity
    ] = await Promise.all([
      Question.countDocuments({ author: user._id, status: 'open' }),
      Answer.countDocuments({ author: user._id }),
      Question.aggregate([
        { $match: { author: user._id } },
        { $group: { _id: null, totalVotes: { $sum: '$votes' } } }
      ]).then(result => result[0]?.totalVotes || 0),
      Answer.countDocuments({ author: user._id, isAccepted: true }),
      Notification.countDocuments({ recipient: user._id }),
      Notification.countDocuments({ recipient: user._id, read: false }),
      Question.find({ author: user._id, status: 'open' })
        .select('title slug votes views answerCount createdAt')
        .sort({ votes: -1 })
        .limit(5),
      Answer.find({ author: user._id })
        .populate('question', 'title slug')
        .select('votes isAccepted createdAt')
        .sort({ votes: -1 })
        .limit(5),
      Question.find({ author: user._id, status: 'open' })
        .select('title slug createdAt lastActivity')
        .sort({ lastActivity: -1 })
        .limit(10),
      // Get monthly activity for the last 12 months
      Question.aggregate([
        {
          $match: {
            author: user._id,
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Calculate reputation breakdown
    const reputationBreakdown = {
      questionVotes: 0,
      answerVotes: 0,
      acceptedAnswers: acceptedAnswers * 15,
      other: 0
    };

    res.json({
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        reputation: user.reputation,
        memberSince: user.createdAt
      },
      stats: {
        questionsAsked,
        answersGiven,
        totalVotesReceived,
        acceptedAnswers,
        notificationCount,
        unreadNotifications,
        ...user.stats
      },
      reputationBreakdown,
      topQuestions,
      topAnswers,
      recentActivity,
      monthlyActivity
    });
  } catch (error) {
    console.error('Get my stats error:', error);
    res.status(500).json({
      message: 'Failed to get your statistics',
      error: error.message
    });
  }
});

// Get tag statistics
router.get('/tags', validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const tagStats = await Question.aggregate([
      { $match: { status: 'open' } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          questionCount: { $sum: 1 },
          totalVotes: { $sum: '$votes' },
          avgVotes: { $avg: '$votes' }
        }
      },
      { $sort: { questionCount: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const totalTags = await Question.aggregate([
      { $match: { status: 'open' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags' } },
      { $count: 'total' }
    ]);

    const total = totalTags[0]?.total || 0;

    res.json({
      tags: tagStats.map(tag => ({
        name: tag._id,
        questionCount: tag.questionCount,
        totalVotes: tag.totalVotes,
        avgVotes: Math.round(tag.avgVotes * 100) / 100
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tag stats error:', error);
    res.status(500).json({
      message: 'Failed to get tag statistics',
      error: error.message
    });
  }
});

// Get leaderboard
router.get('/leaderboard', validateQuery(querySchemas.pagination), async (req, res) => {
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
      leaderboard,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
});

// Get activity timeline
router.get('/activity', validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get recent questions and answers
    const [questions, answers] = await Promise.all([
      Question.find({ status: 'open' })
        .populate('author', 'username avatar')
        .select('title slug votes answerCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Answer.find()
        .populate('author', 'username avatar')
        .populate('question', 'title slug')
        .select('votes isAccepted createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    // Combine and sort by date
    const activities = [
      ...questions.map(q => ({
        type: 'question',
        id: q._id,
        title: q.title,
        slug: q.slug,
        author: q.author,
        votes: q.votes,
        answerCount: q.answerCount,
        createdAt: q.createdAt
      })),
      ...answers.map(a => ({
        type: 'answer',
        id: a._id,
        question: a.question,
        author: a.author,
        votes: a.votes,
        isAccepted: a.isAccepted,
        createdAt: a.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      activities: activities.slice(0, limit),
      pagination: {
        page,
        limit,
        hasMore: activities.length > limit
      }
    });
  } catch (error) {
    console.error('Get activity timeline error:', error);
    res.status(500).json({
      message: 'Failed to get activity timeline',
      error: error.message
    });
  }
});

export default router;
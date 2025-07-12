import express from 'express';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticate, optionalAuth, requireOwnership } from '../middleware/auth.js';
import { validate, validateQuery, validateParams, questionSchemas, querySchemas } from '../middleware/validation.js';

const router = express.Router();

// Get all questions with filtering and search
router.get('/', validateQuery(querySchemas.search), optionalAuth, async (req, res) => {
  try {
    const {
      q,
      tags,
      author,
      difficulty,
      status = 'open',
      hasAnswer,
      page = 1,
      limit = 20,
      sort = 'newest'
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { status };

    // Build search query
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    if (author) {
      query.author = author;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (hasAnswer !== undefined) {
      query.answerCount = hasAnswer === 'true' ? { $gt: 0 } : 0;
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'votes':
        sortOptions = { votes: -1 };
        break;
      case 'views':
        sortOptions = { views: -1 };
        break;
      case 'activity':
        sortOptions = { lastActivity: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const [questions, total] = await Promise.all([
      Question.find(query)
        .populate('author', 'username avatar reputation')
        .select('title slug tags votes views answerCount hasAcceptedAnswer createdAt lastActivity author difficulty')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Question.countDocuments(query)
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
    console.error('Get questions error:', error);
    res.status(500).json({
      message: 'Failed to get questions',
      error: error.message
    });
  }
});

// Get a single question by ID or slug
router.get('/:identifier', optionalAuth, async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is ObjectId or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };
    
    const question = await Question.findOne(query)
      .populate('author', 'username avatar reputation bio socialLinks')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username avatar reputation'
        }
      });

    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    // Increment view count (only for non-authors)
    if (!req.user || question.author._id.toString() !== req.user._id.toString()) {
      await question.incrementViews();
    }

    // Get similar questions
    const similarQuestions = await Question.findSimilar(question.title, question.tags)
      .populate('author', 'username avatar')
      .select('title slug votes answerCount createdAt');

    res.json({
      question,
      similarQuestions
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      message: 'Failed to get question',
      error: error.message
    });
  }
});

// Create a new question
router.post('/', authenticate, validate(questionSchemas.create), async (req, res) => {
  try {
    const { title, description, tags, difficulty = 'beginner' } = req.body;
    const author = req.user._id;

    const question = new Question({
      title,
      description,
      tags,
      difficulty,
      author
    });

    await question.save();

    // Update user stats
    await req.user.updateStats('questionsAsked');

    // Populate author info for response
    await question.populate('author', 'username avatar reputation');

    res.status(201).json({
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      message: 'Failed to create question',
      error: error.message
    });
  }
});

// Update a question
router.put('/:id', authenticate, validateParams(querySchemas.objectId), validate(questionSchemas.update), requireOwnership('question'), async (req, res) => {
  try {
    const question = req.resource;
    const updates = req.body;

    // Update fields
    Object.keys(updates).forEach(key => {
      question[key] = updates[key];
    });

    await question.save();

    // Populate author info for response
    await question.populate('author', 'username avatar reputation');

    res.json({
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      message: 'Failed to update question',
      error: error.message
    });
  }
});

// Delete a question
router.delete('/:id', authenticate, validateParams(querySchemas.objectId), requireOwnership('question'), async (req, res) => {
  try {
    const question = req.resource;

    // Soft delete - change status to deleted
    question.status = 'deleted';
    await question.save();

    // Update user stats
    await req.user.updateStats('questionsAsked', -1);

    res.json({
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      message: 'Failed to delete question',
      error: error.message
    });
  }
});

// Vote on a question
router.post('/:id/vote', authenticate, validateParams(querySchemas.objectId), validate(questionSchemas.vote), async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;
    const userId = req.user._id;

    const question = await Question.findById(id);
    
    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    // Users can't vote on their own questions
    if (question.author.toString() === userId.toString()) {
      return res.status(400).json({
        message: 'You cannot vote on your own question'
      });
    }

    // Apply vote
    switch (voteType) {
      case 'up':
        await question.upvote(userId);
        break;
      case 'down':
        await question.downvote(userId);
        break;
      case 'remove':
        await question.removeVote(userId);
        break;
    }

    // Create notification for question author
    if (voteType !== 'remove') {
      await Notification.createQuestionVoted(
        question._id,
        await User.findById(question.author),
        req.user,
        voteType
      );
    }

    res.json({
      message: 'Vote recorded successfully',
      votes: question.votes
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({
      message: 'Failed to vote on question',
      error: error.message
    });
  }
});

// Get trending questions
router.get('/trending/list', async (req, res) => {
  try {
    const trendingQuestions = await Question.getTrending()
      .populate('author', 'username avatar reputation')
      .select('title slug votes views answerCount createdAt tags');

    res.json({
      questions: trendingQuestions
    });
  } catch (error) {
    console.error('Get trending questions error:', error);
    res.status(500).json({
      message: 'Failed to get trending questions',
      error: error.message
    });
  }
});

// Get questions by tag
router.get('/tag/:tag', validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      Question.findByTag(tag)
        .populate('author', 'username avatar reputation')
        .select('title slug votes views answerCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Question.countDocuments({ tags: tag, status: 'open' })
    ]);

    res.json({
      questions,
      tag,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get questions by tag error:', error);
    res.status(500).json({
      message: 'Failed to get questions by tag',
      error: error.message
    });
  }
});

// Get user's questions
router.get('/user/:userId', validateQuery(querySchemas.pagination), async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      Question.find({ author: userId, status: 'open' })
        .populate('author', 'username avatar reputation')
        .select('title slug votes views answerCount createdAt tags')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Question.countDocuments({ author: userId, status: 'open' })
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

// Accept an answer for a question
router.post('/:id/accept-answer', authenticate, validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { id } = req.params;
    const { answerId } = req.body;

    const question = await Question.findById(id);
    
    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    // Only question author can accept answers
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the question author can accept answers'
      });
    }

    const answer = await Answer.findById(answerId);
    
    if (!answer) {
      return res.status(404).json({
        message: 'Answer not found'
      });
    }

    // Check if answer belongs to this question
    if (answer.question.toString() !== id) {
      return res.status(400).json({
        message: 'Answer does not belong to this question'
      });
    }

    // Accept the answer
    await question.acceptAnswer(answerId);
    
    // Create notification for answer author
    await Notification.createAnswerAccepted(
      answerId,
      await User.findById(answer.author),
      req.user
    );

    res.json({
      message: 'Answer accepted successfully'
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({
      message: 'Failed to accept answer',
      error: error.message
    });
  }
});

// Get question statistics
router.get('/:id/stats', validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findById(id)
      .populate('author', 'username avatar reputation');

    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    const answerStats = await Answer.aggregate([
      { $match: { question: question._id } },
      {
        $group: {
          _id: null,
          totalAnswers: { $sum: 1 },
          totalVotes: { $sum: '$votes' },
          acceptedAnswers: { $sum: { $cond: ['$isAccepted', 1, 0] } }
        }
      }
    ]);

    const stats = answerStats[0] || {
      totalAnswers: 0,
      totalVotes: 0,
      acceptedAnswers: 0
    };

    res.json({
      question: {
        id: question._id,
        title: question.title,
        votes: question.votes,
        views: question.views,
        createdAt: question.createdAt,
        author: question.author
      },
      stats
    });
  } catch (error) {
    console.error('Get question stats error:', error);
    res.status(500).json({
      message: 'Failed to get question statistics',
      error: error.message
    });
  }
});

export default router;
import express from 'express';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticate, requireOwnership } from '../middleware/auth.js';
import { validate, validateParams, answerSchemas, querySchemas } from '../middleware/validation.js';

const router = express.Router();

// Create a new answer
router.post('/', authenticate, validate(answerSchemas.create), async (req, res) => {
  try {
    const { content, questionId } = req.body;
    const author = req.user._id;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    // Create answer
    const answer = new Answer({
      content,
      question: questionId,
      author
    });

    await answer.save();

    // Update user stats
    await req.user.updateStats('answersGiven');

    // Populate author info for response
    await answer.populate('author', 'username avatar reputation');

    // Create notification for question author
    if (question.author.toString() !== author.toString()) {
      await Notification.createQuestionAnswered(
        questionId,
        answer._id,
        await User.findById(question.author),
        req.user
      );
    }

    res.status(201).json({
      message: 'Answer created successfully',
      answer
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({
      message: 'Failed to create answer',
      error: error.message
    });
  }
});

// Get answers for a question
router.get('/question/:questionId', validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { questionId } = req.params;

    const answers = await Answer.findByQuestion(questionId);

    res.json({
      answers
    });
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({
      message: 'Failed to get answers',
      error: error.message
    });
  }
});

// Get a single answer
router.get('/:id', validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id)
      .populate('author', 'username avatar reputation bio')
      .populate('question', 'title slug');

    if (!answer) {
      return res.status(404).json({
        message: 'Answer not found'
      });
    }

    res.json({
      answer
    });
  } catch (error) {
    console.error('Get answer error:', error);
    res.status(500).json({
      message: 'Failed to get answer',
      error: error.message
    });
  }
});

// Update an answer
router.put('/:id', authenticate, validateParams(querySchemas.objectId), validate(answerSchemas.update), requireOwnership('answer'), async (req, res) => {
  try {
    const answer = req.resource;
    const { content, reason } = req.body;

    // Save previous content for edit history
    const previousContent = answer.content;

    // Update answer
    answer.content = content;
    
    // Add to edit history
    await answer.addEdit(req.user._id, reason, previousContent);

    // Populate author info for response
    await answer.populate('author', 'username avatar reputation');

    res.json({
      message: 'Answer updated successfully',
      answer
    });
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({
      message: 'Failed to update answer',
      error: error.message
    });
  }
});

// Delete an answer
router.delete('/:id', authenticate, validateParams(querySchemas.objectId), requireOwnership('answer'), async (req, res) => {
  try {
    const answer = req.resource;

    // Remove answer
    await answer.deleteOne();

    // Update user stats
    await req.user.updateStats('answersGiven', -1);

    res.json({
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({
      message: 'Failed to delete answer',
      error: error.message
    });
  }
});

// Vote on an answer
router.post('/:id/vote', authenticate, validateParams(querySchemas.objectId), validate(answerSchemas.vote), async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;
    const userId = req.user._id;

    const answer = await Answer.findById(id);
    
    if (!answer) {
      return res.status(404).json({
        message: 'Answer not found'
      });
    }

    // Users can't vote on their own answers
    if (answer.author.toString() === userId.toString()) {
      return res.status(400).json({
        message: 'You cannot vote on your own answer'
      });
    }

    // Apply vote
    switch (voteType) {
      case 'up':
        await answer.upvote(userId);
        break;
      case 'down':
        await answer.downvote(userId);
        break;
      case 'remove':
        await answer.removeVote(userId);
        break;
    }

    // Create notification for answer author
    if (voteType !== 'remove') {
      await Notification.createAnswerVoted(
        answer._id,
        await User.findById(answer.author),
        req.user,
        voteType
      );
    }

    res.json({
      message: 'Vote recorded successfully',
      votes: answer.votes
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({
      message: 'Failed to vote on answer',
      error: error.message
    });
  }
});

// Accept an answer
router.post('/:id/accept', authenticate, validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);
    
    if (!answer) {
      return res.status(404).json({
        message: 'Answer not found'
      });
    }

    // Get the question to check ownership
    const question = await Question.findById(answer.question);
    
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

    // Accept the answer
    await answer.markAsAccepted();

    // Create notification for answer author
    await Notification.createAnswerAccepted(
      answer._id,
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

// Mark answer as helpful
router.post('/:id/helpful', authenticate, validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);
    
    if (!answer) {
      return res.status(404).json({
        message: 'Answer not found'
      });
    }

    // Users can't mark their own answers as helpful
    if (answer.author.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot mark your own answer as helpful'
      });
    }

    await answer.markAsHelpful();

    res.json({
      message: 'Answer marked as helpful',
      helpfulCount: answer.helpfulCount
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      message: 'Failed to mark answer as helpful',
      error: error.message
    });
  }
});

// Get user's answers
router.get('/user/:userId', validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [answers, total] = await Promise.all([
      Answer.find({ author: userId })
        .populate('author', 'username avatar reputation')
        .populate('question', 'title slug')
        .select('content votes isAccepted helpfulCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Answer.countDocuments({ author: userId })
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

// Get user's top answers
router.get('/user/:userId/top', validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const answers = await Answer.findTopByUser(userId, limit);

    res.json({
      answers
    });
  } catch (error) {
    console.error('Get user top answers error:', error);
    res.status(500).json({
      message: 'Failed to get user top answers',
      error: error.message
    });
  }
});

// Get user's accepted answers
router.get('/user/:userId/accepted', validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { userId } = req.params;

    const answers = await Answer.findAcceptedByUser(userId);

    res.json({
      answers
    });
  } catch (error) {
    console.error('Get user accepted answers error:', error);
    res.status(500).json({
      message: 'Failed to get user accepted answers',
      error: error.message
    });
  }
});

// Get answer edit history
router.get('/:id/history', validateParams(querySchemas.objectId), async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id)
      .populate('lastEditedBy', 'username avatar')
      .select('editHistory lastEditedAt lastEditedBy');

    if (!answer) {
      return res.status(404).json({
        message: 'Answer not found'
      });
    }

    res.json({
      editHistory: answer.editHistory,
      lastEditedAt: answer.lastEditedAt,
      lastEditedBy: answer.lastEditedBy
    });
  } catch (error) {
    console.error('Get answer history error:', error);
    res.status(500).json({
      message: 'Failed to get answer history',
      error: error.message
    });
  }
});

export default router;
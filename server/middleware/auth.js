import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to authenticate JWT tokens
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired.' 
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ 
      message: 'Authentication failed.' 
    });
  }
};

// Middleware for optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    req.user = null;
    next();
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Access denied. Authentication required.' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  
  next();
};

// Middleware to check if user is moderator or admin
export const requireModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Access denied. Authentication required.' 
    });
  }
  
  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Access denied. Moderator privileges required.' 
    });
  }
  
  next();
};

// Middleware to check if user has sufficient reputation
export const requireReputation = (minReputation) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Access denied. Authentication required.' 
      });
    }
    
    if (req.user.reputation < minReputation) {
      return res.status(403).json({ 
        message: `Access denied. Minimum reputation of ${minReputation} required.` 
      });
    }
    
    next();
  };
};

// Middleware to check if user owns the resource
export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Access denied. Authentication required.' 
        });
      }
      
      const resourceId = req.params.id;
      let resource;
      
      switch (resourceType) {
        case 'question':
          const Question = (await import('../models/Question.js')).default;
          resource = await Question.findById(resourceId);
          break;
        case 'answer':
          const Answer = (await import('../models/Answer.js')).default;
          resource = await Answer.findById(resourceId);
          break;
        default:
          return res.status(400).json({ 
            message: 'Invalid resource type.' 
          });
      }
      
      if (!resource) {
        return res.status(404).json({ 
          message: `${resourceType} not found.` 
        });
      }
      
      if (resource.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          message: 'Access denied. You can only modify your own content.' 
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ 
        message: 'Authorization failed.' 
      });
    }
  };
};

// Utility function to generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Utility function to generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

// Middleware to validate refresh token
export const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        message: 'Refresh token required.' 
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        message: 'Invalid refresh token.' 
      });
    }

    const user = await User.findById(decoded.userId);
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ 
        message: 'Invalid refresh token.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid refresh token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Refresh token expired.' 
      });
    }
    
    console.error('Refresh token validation error:', error);
    res.status(500).json({ 
      message: 'Token validation failed.' 
    });
  }
};

// Middleware to update user's last login
export const updateLastLogin = async (req, res, next) => {
  try {
    if (req.user) {
      req.user.lastLogin = new Date();
      await req.user.save();
    }
    next();
  } catch (error) {
    console.error('Update last login error:', error);
    // Don't fail the request if this fails
    next();
  }
};
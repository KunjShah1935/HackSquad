import Joi from 'joi';

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        message: 'Validation error',
        error: errorMessage,
        details: error.details
      });
    }
    
    next();
  };
};

// Query parameter validation
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        message: 'Query validation error',
        error: errorMessage,
        details: error.details
      });
    }
    
    next();
  };
};

// Parameter validation
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        message: 'Parameter validation error',
        error: errorMessage,
        details: error.details
      });
    }
    
    next();
  };
};

// Auth validation schemas
export const authSchemas = {
  register: Joi.object({
    username: Joi.string().trim().min(3).max(50).required()
      .pattern(/^[a-zA-Z0-9_]+$/)
      .messages({
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 50 characters'
      }),
    email: Joi.string().email().trim().lowercase().required()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    password: Joi.string().min(6).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'string.min': 'Password must be at least 6 characters long'
      }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
      .messages({
        'any.only': 'Confirm password must match password'
      }),
    bio: Joi.string().max(500).optional(),
    avatar: Joi.string().uri().optional()
  }),
  
  login: Joi.object({
    email: Joi.string().email().trim().lowercase().required()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    password: Joi.string().required()
      .messages({
        'any.required': 'Password is required'
      })
  }),
  
  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
      .messages({
        'any.required': 'Refresh token is required'
      })
  }),
  
  forgotPassword: Joi.object({
    email: Joi.string().email().trim().lowercase().required()
      .messages({
        'string.email': 'Please provide a valid email address'
      })
  }),
  
  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'string.min': 'Password must be at least 6 characters long'
      })
  })
};

// Question validation schemas
export const questionSchemas = {
  create: Joi.object({
    title: Joi.string().trim().min(10).max(300).required()
      .messages({
        'string.min': 'Title must be at least 10 characters long',
        'string.max': 'Title cannot exceed 300 characters'
      }),
    description: Joi.string().trim().min(20).max(5000).required()
      .messages({
        'string.min': 'Description must be at least 20 characters long',
        'string.max': 'Description cannot exceed 5000 characters'
      }),
    tags: Joi.array().items(
      Joi.string().trim().lowercase().min(1).max(50)
    ).min(1).max(10).required()
      .messages({
        'array.min': 'At least one tag is required',
        'array.max': 'Maximum 10 tags allowed'
      }),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional()
  }),
  
  update: Joi.object({
    title: Joi.string().trim().min(10).max(300).optional(),
    description: Joi.string().trim().min(20).max(5000).optional(),
    tags: Joi.array().items(
      Joi.string().trim().lowercase().min(1).max(50)
    ).min(1).max(10).optional(),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional()
  }),
  
  vote: Joi.object({
    voteType: Joi.string().valid('up', 'down', 'remove').required()
  })
};

// Answer validation schemas
export const answerSchemas = {
  create: Joi.object({
    content: Joi.string().trim().min(10).max(10000).required()
      .messages({
        'string.min': 'Answer must be at least 10 characters long',
        'string.max': 'Answer cannot exceed 10000 characters'
      }),
    questionId: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'Invalid question ID format',
        'string.length': 'Invalid question ID length'
      })
  }),
  
  update: Joi.object({
    content: Joi.string().trim().min(10).max(10000).required()
      .messages({
        'string.min': 'Answer must be at least 10 characters long',
        'string.max': 'Answer cannot exceed 10000 characters'
      }),
    reason: Joi.string().trim().max(200).optional()
  }),
  
  vote: Joi.object({
    voteType: Joi.string().valid('up', 'down', 'remove').required()
  })
};

// User validation schemas
export const userSchemas = {
  updateProfile: Joi.object({
    username: Joi.string().trim().min(3).max(50).optional()
      .pattern(/^[a-zA-Z0-9_]+$/)
      .messages({
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores'
      }),
    bio: Joi.string().max(500).optional(),
    avatar: Joi.string().uri().optional(),
    socialLinks: Joi.object({
      github: Joi.string().uri().optional(),
      linkedin: Joi.string().uri().optional(),
      twitter: Joi.string().uri().optional(),
      website: Joi.string().uri().optional()
    }).optional(),
    preferences: Joi.object({
      emailNotifications: Joi.boolean().optional(),
      darkMode: Joi.boolean().optional(),
      language: Joi.string().valid('en', 'es', 'fr', 'de').optional()
    }).optional()
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
      .messages({
        'any.only': 'Confirm password must match new password'
      })
  })
};

// Query validation schemas
export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('newest', 'oldest', 'votes', 'views', 'activity').default('newest'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),
  
  search: Joi.object({
    q: Joi.string().trim().min(2).max(200).optional(),
    tags: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    author: Joi.string().hex().length(24).optional(),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    status: Joi.string().valid('open', 'closed', 'deleted').default('open'),
    hasAnswer: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),
  
  objectId: Joi.object({
    id: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'Invalid ID format',
        'string.length': 'Invalid ID length'
      })
  })
};

// Notification validation schemas
export const notificationSchemas = {
  markAsRead: Joi.object({
    notificationIds: Joi.array().items(
      Joi.string().hex().length(24)
    ).min(1).required()
  })
};

// Export validation helpers
export const validateEmail = (email) => {
  const schema = Joi.string().email().required();
  return schema.validate(email);
};

export const validatePassword = (password) => {
  const schema = Joi.string().min(6).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required();
  return schema.validate(password);
};

export const validateObjectId = (id) => {
  const schema = Joi.string().hex().length(24).required();
  return schema.validate(id);
};

export const sanitizeHtml = (content) => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '');
};
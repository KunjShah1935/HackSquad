import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import answerRoutes from './routes/answers.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('⚠️  Running in demo mode without MongoDB');
    console.log('💡 To use full functionality, install and start MongoDB:');
    console.log('   - Install MongoDB: https://docs.mongodb.com/manual/installation/');
    console.log('   - Start MongoDB: mongod');
    return false;
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Demo mode endpoint
app.get('/api/demo', (req, res) => {
  res.json({
    message: 'Backend API is running in demo mode',
    features: [
      'Authentication with JWT tokens',
      'Question and Answer CRUD operations',
      'Voting system with reputation tracking',
      'Notification system',
      'User statistics and analytics',
      'Search and filtering capabilities'
    ],
    endpoints: {
      auth: '/api/auth/*',
      questions: '/api/questions/*',
      answers: '/api/answers/*',
      users: '/api/users/*',
      notifications: '/api/notifications/*',
      stats: '/api/stats/*'
    },
    note: 'Full functionality requires MongoDB connection'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
connectDB().then((mongoConnected) => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🎯 Demo endpoint: http://localhost:${PORT}/api/demo`);
    
    if (mongoConnected) {
      console.log('✅ MongoDB connected - Full functionality available');
    } else {
      console.log('⚠️  MongoDB not connected - Limited functionality');
      console.log('💡 Install MongoDB for full features');
    }
  });
});

export default app;
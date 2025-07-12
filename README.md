# StackIt - Q&A Platform Backend

A comprehensive backend system for a Stack Overflow-like Q&A platform built with Node.js, Express, MongoDB, and JWT authentication.

## 🚀 Features

### Authentication & User Management
- **User Registration & Login** with JWT tokens
- **Password hashing** with bcrypt
- **Token refresh** mechanism
- **Password reset** functionality
- **User profile management**
- **Account deactivation**

### Questions & Answers
- **CRUD operations** for questions and answers
- **Voting system** (upvote/downvote) with reputation tracking
- **Answer acceptance** by question authors
- **Question categorization** with tags
- **Search and filtering** capabilities
- **View count tracking**

### Notifications
- **Real-time notifications** for user interactions
- **Notification preferences** management
- **Bulk operations** (mark all as read, delete multiple)
- **Notification statistics**

### Statistics & Analytics
- **System-wide statistics** (total users, questions, answers)
- **User statistics** (reputation, activity, leaderboard)
- **Tag statistics** and trending topics
- **Activity timeline**

### Advanced Features
- **Reputation system** with point rewards
- **Badge system** (placeholder implementation)
- **Answer edit history**
- **Question slugs** for SEO-friendly URLs
- **Comprehensive validation** with Joi
- **Rate limiting** and security middleware

## 📁 Project Structure

```
server/
├── index.js                 # Main server file
├── models/                  # Database models
│   ├── User.js             # User model with authentication
│   ├── Question.js         # Question model with voting
│   ├── Answer.js           # Answer model with acceptance
│   └── Notification.js     # Notification model
├── routes/                  # API routes
│   ├── auth.js             # Authentication routes
│   ├── questions.js        # Question CRUD & voting
│   ├── answers.js          # Answer CRUD & voting
│   ├── users.js            # User management
│   ├── notifications.js    # Notification management
│   └── stats.js            # Statistics & analytics
├── middleware/              # Custom middleware
│   ├── auth.js             # JWT authentication
│   └── validation.js       # Input validation
└── .env                     # Environment variables
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stackit-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/stackit
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the server**
   ```bash
   # Development mode
   npm run backend
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "bio": "Software developer",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### Question Endpoints

#### Get Questions
```http
GET /api/questions?page=1&limit=20&sort=newest&tags=javascript,react
```

#### Create Question
```http
POST /api/questions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "How to implement authentication in React?",
  "description": "I need help implementing JWT authentication...",
  "tags": ["react", "jwt", "authentication"],
  "difficulty": "intermediate"
}
```

#### Vote on Question
```http
POST /api/questions/:id/vote
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "voteType": "up" // or "down" or "remove"
}
```

### Answer Endpoints

#### Create Answer
```http
POST /api/answers
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "You can use React Context API with JWT tokens...",
  "questionId": "60a1b2c3d4e5f6789abcdef0"
}
```

#### Vote on Answer
```http
POST /api/answers/:id/vote
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "voteType": "up"
}
```

#### Accept Answer
```http
POST /api/answers/:id/accept
Authorization: Bearer <access_token>
```

### Statistics Endpoints

#### System Statistics
```http
GET /api/stats/system
```

#### User Statistics
```http
GET /api/stats/user/:userId
```

#### Leaderboard
```http
GET /api/stats/leaderboard?page=1&limit=50
```

### Notification Endpoints

#### Get Notifications
```http
GET /api/notifications?page=1&limit=20&read=false
Authorization: Bearer <access_token>
```

#### Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <access_token>
```

#### Get Unread Count
```http
GET /api/notifications/unread/count
Authorization: Bearer <access_token>
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/stackit` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Database Models

#### User Model
- Authentication fields (email, password, tokens)
- Profile information (username, bio, avatar)
- Statistics tracking (questions, answers, votes)
- Reputation system
- Preferences and settings

#### Question Model
- Content fields (title, description, tags)
- Voting system with user tracking
- Answer counting and acceptance
- View tracking and SEO slugs
- Status management (open/closed/deleted)

#### Answer Model
- Content and authorship
- Voting and acceptance
- Edit history tracking
- Quality metrics (helpful count)

#### Notification Model
- Type-based notifications
- Read/unread status
- Priority levels
- Bulk operations support

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Password hashing** with bcrypt (12 rounds)
- **Input validation** with Joi schemas
- **Rate limiting** (100 requests per 15 minutes)
- **CORS configuration** for frontend integration
- **Security headers** with Helmet.js
- **MongoDB injection** protection
- **User authorization** for resource access

## 📊 Statistics & Analytics

### System-wide Statistics
- Total users, questions, answers
- Daily activity metrics
- Trending tags and topics
- Top contributors

### User Statistics
- Reputation and ranking
- Activity history
- Question/answer performance
- Badge achievements

### Advanced Analytics
- Monthly activity tracking
- Tag popularity trends
- User engagement metrics
- Content quality indicators

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure MongoDB with authentication
4. Set up reverse proxy (Nginx)
5. Enable SSL/TLS

### Performance Optimization
- MongoDB indexing for queries
- Connection pooling
- Caching with Redis (optional)
- Image compression and CDN
- API response compression

### Monitoring
- Health check endpoint: `/api/health`
- Error logging and tracking
- Performance metrics
- Database monitoring

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Test coverage
npm run test:coverage
```

### Test Categories
- Authentication flow
- API endpoints
- Database operations
- Validation logic
- Security measures

## 📈 Reputation System

### Point Awards
- **Question upvote**: +5 points
- **Answer upvote**: +10 points
- **Answer accepted**: +15 points
- **Question downvote**: -2 points
- **Answer downvote**: -2 points

### Reputation Levels
- **Newbie**: 0-99 points
- **Contributor**: 100-499 points
- **Regular**: 500-999 points
- **Trusted**: 1000-4999 points
- **Expert**: 5000+ points

## 🔄 Notification System

### Notification Types
- Question answered
- Answer/question voted
- Answer accepted
- New followers
- Mentions
- System announcements

### Delivery Methods
- In-app notifications
- Email notifications (configurable)
- Push notifications (future)

## 🏷️ Badge System

### Available Badges
- **Inquisitive**: Ask 10+ questions
- **Helpful**: Provide 10+ answers
- **Reputable**: Earn 100+ reputation
- **Trusted**: Earn 1000+ reputation
- **Expert**: Earn 10000+ reputation

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🤝 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

Built with ❤️ using Node.js, Express, MongoDB, and modern web technologies.
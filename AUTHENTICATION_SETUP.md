# Authentication System Setup

## Overview
Your project now has a complete authentication system integrated with MongoDB. Here's what has been added:

## Backend Features (Already Implemented)
- User registration and login with JWT tokens
- Password hashing with bcrypt
- Token refresh mechanism
- User profile management
- Password reset functionality
- Account deactivation
- MongoDB User model with reputation system

## Frontend Features (Newly Added)
- `AuthModal` component for sign-in/sign-up
- `useAuth` hook for authentication state management
- Integration with existing Header component
- Logout functionality
- Automatic token refresh

## How to Use

### 1. Start MongoDB
First, make sure MongoDB is installed and running on your system:

**On Ubuntu/Debian:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**On macOS with Homebrew:**
```bash
brew services start mongodb-community
```

**On Windows:**
```bash
# Start MongoDB from the Services app or run:
mongod --config "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
```

**Or using Docker:**
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### 2. Start the Backend Server
```bash
npm run backend
```

### 3. Start the Frontend Development Server
```bash
npm run dev
```

### 3. Access the Application
- Visit `http://localhost:5173`
- Click the "Login" button in the header
- Choose between "Sign In" or "Sign Up"

### 4. Authentication Flow
1. **Sign Up**: New users can create an account with username, email, and password
2. **Sign In**: Existing users can log in with email and password
3. **Auto-login**: Users stay logged in across browser sessions
4. **Logout**: Users can log out using the logout button in the header

## Database Configuration
Make sure your MongoDB server is running and accessible. The default connection string is:
```
mongodb://localhost:27017/stackit
```

You can change this by setting the `MONGODB_URI` environment variable in your server configuration.

## Environment Variables
The following environment variables are available:
- `VITE_API_URL`: Backend API URL (default: http://localhost:5000)
- `VITE_FRONTEND_URL`: Frontend URL (default: http://localhost:5173)

## Authentication State
The authentication system provides:
- `currentUser`: Current user object or null
- `isAuthenticated`: Boolean indicating if user is logged in
- `isLoading`: Boolean indicating if authentication is being checked
- `login()`: Function to log in a user
- `logout()`: Function to log out a user

## Security Features
- JWT tokens with automatic refresh
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers

## Next Steps
1. Test the authentication system by creating a new account
2. Customize the AuthModal styling if needed
3. Add any additional user profile fields
4. Implement email verification (optional)
5. Add social media login options (optional)

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error:**
   - Make sure MongoDB is installed and running
   - Check if MongoDB is accessible on port 27017
   - Test with: `mongo` or `mongosh` command

2. **Backend Server Issues:**
   - Check the server logs for any errors
   - Ensure no other service is using port 5000
   - Verify all dependencies are installed: `npm install`

3. **Frontend Issues:**
   - Check the browser console for JavaScript errors
   - Ensure the frontend can reach the backend API
   - Verify that port 5173 is available

4. **Authentication Not Working:**
   - Check network tab in browser dev tools for failed API calls
   - Verify the CORS configuration allows requests from your frontend
   - Ensure JWT tokens are being stored correctly in localStorage

### Debug Commands:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Test MongoDB connection
mongosh --eval "db.runCommand({ping: 1})"

# Check server logs
npm run backend

# Test API endpoint
curl http://localhost:5000/api/health
```
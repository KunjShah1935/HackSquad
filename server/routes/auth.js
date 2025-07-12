import express from 'express';
import User from '../models/User.js';
import { 
  authenticate, 
  generateToken, 
  generateRefreshToken, 
  validateRefreshToken,
  updateLastLogin
} from '../middleware/auth.js';
import { validate, authSchemas } from '../middleware/validation.js';

const router = express.Router();

// Register new user
router.post('/register', validate(authSchemas.register), async (req, res) => {
  try {
    const { username, email, password, bio, avatar } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email 
          ? 'User with this email already exists' 
          : 'Username already taken'
      });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      bio: bio || '',
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`
    });
    
    await user.save();
    
    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        reputation: user.reputation,
        stats: user.stats,
        preferences: user.preferences
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login user
router.post('/login', validate(authSchemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        message: 'Account is deactivated'
      });
    }
    
    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }
    
    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Update user with refresh token and last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        reputation: user.reputation,
        stats: user.stats,
        preferences: user.preferences,
        lastLogin: user.lastLogin
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
});

// Refresh access token
router.post('/refresh', validateRefreshToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Generate new tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Update refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    res.json({
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      message: 'Token refresh failed',
      error: error.message
    });
  }
});

// Logout user
router.post('/logout', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // Clear refresh token
    user.refreshToken = null;
    await user.save();
    
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Logout failed',
      error: error.message
    });
  }
});

// Get current user profile
router.get('/me', authenticate, updateLastLogin, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        reputation: user.reputation,
        stats: user.stats,
        preferences: user.preferences,
        socialLinks: user.socialLinks,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/me', authenticate, validate(authSchemas.updateProfile || {}), async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;
    
    // Check if username is being updated and is available
    if (updates.username && updates.username !== user.username) {
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
        user[key] = { ...user[key], ...updates[key] };
      } else {
        user[key] = updates[key];
      }
    });
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        reputation: user.reputation,
        stats: user.stats,
        preferences: user.preferences,
        socialLinks: user.socialLinks
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Change password
router.put('/change-password', authenticate, validate(authSchemas.changePassword || {}), async (req, res) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// Forgot password
router.post('/forgot-password', validate(authSchemas.forgotPassword), async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        message: 'If an account with this email exists, a password reset link has been sent'
      });
    }
    
    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();
    
    // In production, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    res.json({
      message: 'If an account with this email exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
});

// Reset password
router.post('/reset-password', validate(authSchemas.resetPassword), async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        message: 'Password reset token is invalid or has expired'
      });
    }
    
    // Update password and clear reset token
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    
    res.json({
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

// Check if username is available
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username });
    
    res.json({
      available: !user
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({
      message: 'Failed to check username availability',
      error: error.message
    });
  }
});

// Check if email is available
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ email });
    
    res.json({
      available: !user
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      message: 'Failed to check email availability',
      error: error.message
    });
  }
});

// Deactivate account
router.delete('/deactivate', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    user.isActive = false;
    user.refreshToken = null;
    await user.save();
    
    res.json({
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      message: 'Failed to deactivate account',
      error: error.message
    });
  }
});

export default router;
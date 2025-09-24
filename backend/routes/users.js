const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const RTIApplication = require('../models/RTIApplication');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences,
        profilePicture: user.profilePicture,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s-()]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('address.pincode')
    .optional()
    .trim()
    .isLength({ max: 10 }),
  body('preferences.language')
    .optional()
    .isIn(['english', 'hindi', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati']),
  body('preferences.notifications.email')
    .optional()
    .isBoolean(),
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      phone,
      address,
      preferences
    } = req.body;

    const updateData = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (address) {
      updateData.address = { ...req.user.address, ...address };
    }
    if (preferences) {
      updateData.preferences = { ...req.user.preferences, ...preferences };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', async (req, res, next) => {
  try {
    // Get RTI statistics
    const stats = await RTIApplication.getStatsByUser(req.user._id);
    
    const totalApplications = await RTIApplication.countDocuments({ user: req.user._id });
    
    const statsMap = {
      draft: 0,
      submitted: 0,
      'under-review': 0,
      responded: 0,
      rejected: 0
    };
    
    stats.forEach(stat => {
      statsMap[stat._id] = stat.count;
    });

    // Get recent applications
    const recentApplications = await RTIApplication.findByUser(req.user._id, {
      limit: 5,
      sort: { createdAt: -1 }
    });

    // Get applications by category
    const categoryStats = await RTIApplication.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total: totalApplications,
          ...statsMap
        },
        recentApplications,
        categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user activity
// @route   GET /api/users/activity
// @access  Private
router.get('/activity', async (req, res, next) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const activities = await RTIApplication.findByUser(req.user._id, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      sort: { createdAt: -1 }
    });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

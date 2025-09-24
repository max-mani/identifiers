const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Template = require('../models/Template');

const router = express.Router();

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public
router.get('/', [
  query('category').optional().isString(),
  query('language').optional().isIn(['english', 'hindi', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati']),
  query('popular').optional().isBoolean(),
  query('search').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('skip').optional().isInt({ min: 0 }),
  query('sort').optional().isIn(['name', 'usage', 'rating', 'createdAt'])
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
      category,
      language,
      popular,
      search,
      limit = 20,
      skip = 0,
      sort = 'usage'
    } = req.query;

    let templates;
    let total;

    if (popular === 'true') {
      // Get popular templates
      templates = await Template.findPopular({
        category,
        language,
        limit: parseInt(limit)
      });
      total = await Template.countDocuments({
        isPopular: true,
        isActive: true,
        ...(category && { category }),
        ...(language && { language })
      });
    } else if (search) {
      // Search templates
      templates = await Template.search(search, {
        category,
        language,
        limit: parseInt(limit),
        skip: parseInt(skip),
        sort: sort === 'usage' ? { usage: -1 } : { [sort]: -1 }
      });
      total = await Template.countDocuments({
        isActive: true,
        $or: [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { tags: new RegExp(search, 'i') }
        ],
        ...(category && { category }),
        ...(language && { language })
      });
    } else {
      // Get templates by category
      templates = await Template.findByCategory(category || 'Infrastructure', {
        language,
        limit: parseInt(limit),
        skip: parseInt(skip),
        sort: sort === 'usage' ? { usage: -1 } : { [sort]: -1 }
      });
      total = await Template.countDocuments({
        category: category || 'Infrastructure',
        isActive: true,
        ...(language && { language })
      });
    }

    res.status(200).json({
      success: true,
      count: templates.length,
      total,
      data: templates
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get template by ID
// @route   GET /api/templates/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template || !template.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get template categories
// @route   GET /api/templates/categories
// @access  Public
router.get('/categories', async (req, res, next) => {
  try {
    const stats = await Template.getStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Rate template
// @route   POST /api/templates/:id/rate
// @access  Public
router.post('/:id/rate', [
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
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

    const { rating } = req.body;

    const template = await Template.findById(req.params.id);

    if (!template || !template.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    await template.addRating(rating);

    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      data: {
        averageRating: template.rating.average,
        ratingCount: template.rating.count
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

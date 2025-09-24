const express = require('express');
const { body, validationResult, query } = require('express-validator');
const RTIApplication = require('../models/RTIApplication');
const Template = require('../models/Template');
const geminiService = require('../services/geminiService');
const { uploadAudio, handleUploadError, getFileInfo } = require('../middleware/upload');
const { checkOwnership } = require('../middleware/auth');

const router = express.Router();
// @desc    Get clarification questions for missing details
// @route   POST /api/rti/clarify
// @access  Private
router.post('/clarify', [
  body('query').trim().isLength({ min: 10 }).withMessage('Query is required'),
  body('language').optional().isIn(['english', 'hindi', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { query, language = 'english' } = req.body;
    const result = await geminiService.generateClarificationQuestions(query, { language });
    return res.status(200).json({ success: true, data: result.questions });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all RTI applications for user
// @route   GET /api/rti
// @access  Private
router.get('/', [
  query('status').optional().isIn(['draft', 'submitted', 'under-review', 'responded', 'rejected']),
  query('category').optional().isIn(['financial', 'infrastructure', 'policies', 'services', 'personnel', 'legal', 'other']),
  query('sort').optional().isIn(['newest', 'oldest', 'title', 'status']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('skip').optional().isInt({ min: 0 })
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

    const { status, category, sort = 'newest', limit = 20, skip = 0 } = req.query;

    let sortOption = { createdAt: -1 };
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      case 'status':
        sortOption = { status: 1 };
        break;
    }

    const applications = await RTIApplication.findByUser(req.user._id, {
      status,
      category,
      sort: sortOption,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    const total = await RTIApplication.countDocuments({
      user: req.user._id,
      ...(status && { status }),
      ...(category && { category })
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      data: applications
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get RTI application by ID
// @route   GET /api/rti/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const application = await RTIApplication.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('metadata.templateId', 'name category');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'RTI application not found'
      });
    }

    // Check ownership
    if (application.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this application'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create RTI application from text
// @route   POST /api/rti/generate
// @access  Private
router.post('/generate', [
  body('query')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Query must be between 10 and 2000 characters'),
  body('department')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Department must be between 2 and 200 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('category')
    .isIn(['financial', 'infrastructure', 'policies', 'services', 'personnel', 'legal', 'other'])
    .withMessage('Invalid category'),
  body('language')
    .optional()
    .isIn(['english', 'hindi', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati']),
  body('timeframe')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  body('additionalDetails')
    .optional()
    .trim()
    .isLength({ max: 1000 }),
  body('documentTypes')
    .optional()
    .isArray(),
  body('priority')
    .optional()
    .isIn(['normal', 'urgent'])
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
      query,
      department,
      location,
      category,
      language = 'english',
      timeframe,
      additionalDetails,
      documentTypes = [],
      priority = 'normal'
    } = req.body;

    // Generate RTI using Gemini
    const result = await geminiService.generateRTIFromText(query, {
      department,
      location,
      category,
      language,
      userDetails: {
        fullName: req.user.fullName,
        address: req.user.completeAddress,
        phone: req.user.phone,
        email: req.user.email
      }
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate RTI application'
      });
    }

    // Create RTI application
    const application = await RTIApplication.create({
      user: req.user._id,
      title: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      description: query,
      originalQuery: query,
      generatedText: result.generatedText,
      department,
      location,
      category,
      language,
      timeframe,
      additionalDetails,
      documentTypes,
      priority,
      metadata: {
        generatedBy: 'quick-draft',
        generationTime: new Date(),
        aiModel: result.metadata.model
      }
    });

    const populatedApplication = await RTIApplication.findById(application._id)
      .populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'RTI application generated successfully',
      data: populatedApplication
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create RTI application from audio
// @route   POST /api/rti/generate-audio
// @access  Private
router.post('/generate-audio', uploadAudio, handleUploadError, [
  body('department')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Department must be between 2 and 200 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('category')
    .isIn(['financial', 'infrastructure', 'policies', 'services', 'personnel', 'legal', 'other'])
    .withMessage('Invalid category'),
  body('timeframe')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  body('additionalDetails')
    .optional()
    .trim()
    .isLength({ max: 1000 }),
  body('documentTypes')
    .optional()
    .isArray(),
  body('priority')
    .optional()
    .isIn(['normal', 'urgent'])
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required'
      });
    }

    const {
      department,
      location,
      category,
      timeframe,
      additionalDetails,
      documentTypes = [],
      priority = 'normal'
    } = req.body;

    // Process audio and generate RTI
    const result = await geminiService.processAudioAndGenerateRTI(req.file.path, {
      department,
      location,
      category,
      userDetails: {
        fullName: req.user.fullName,
        address: req.user.completeAddress,
        phone: req.user.phone,
        email: req.user.email
      }
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to process audio and generate RTI application'
      });
    }

    // Get file info
    const audioFileInfo = getFileInfo(req.file);

    // Create RTI application
    const application = await RTIApplication.create({
      user: req.user._id,
      title: result.audioTranscription.text.substring(0, 100) + '...',
      description: result.audioTranscription.text,
      originalQuery: result.audioTranscription.text,
      generatedText: result.generatedText,
      department,
      location,
      category,
      language: result.languageDetection.language,
      timeframe,
      additionalDetails,
      documentTypes,
      priority,
      audioFile: audioFileInfo,
      metadata: {
        generatedBy: 'audio-input',
        generationTime: new Date(),
        aiModel: result.metadata.model
      }
    });

    const populatedApplication = await RTIApplication.findById(application._id)
      .populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'RTI application generated from audio successfully',
      data: populatedApplication,
      audioTranscription: result.audioTranscription,
      languageDetection: result.languageDetection
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create RTI application from template
// @route   POST /api/rti/from-template
// @access  Private
router.post('/from-template', [
  body('templateId')
    .isMongoId()
    .withMessage('Valid template ID is required'),
  body('variables')
    .isObject()
    .withMessage('Variables must be an object')
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

    const { templateId, variables = {} } = req.body;

    // Get template
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Generate RTI using template
    const result = await geminiService.generateRTIFromTemplate(template.templateContent, variables);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate RTI from template'
      });
    }

    // Increment template usage
    await template.incrementUsage();

    // Create RTI application
    const application = await RTIApplication.create({
      user: req.user._id,
      title: template.name,
      description: template.description,
      originalQuery: JSON.stringify(variables),
      generatedText: result.generatedText,
      department: variables.department || 'Government Department',
      location: variables.location || 'Your City',
      category: template.category.toLowerCase().replace(' ', '-'),
      language: template.language,
      metadata: {
        generatedBy: 'template',
        templateId: template._id,
        generationTime: new Date(),
        aiModel: result.metadata.model
      }
    });

    const populatedApplication = await RTIApplication.findById(application._id)
      .populate('user', 'firstName lastName email')
      .populate('metadata.templateId', 'name category');

    res.status(201).json({
      success: true,
      message: 'RTI application generated from template successfully',
      data: populatedApplication
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update RTI application
// @route   PUT /api/rti/:id
// @access  Private
router.put('/:id', checkOwnership(), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }),
  body('category')
    .optional()
    .isIn(['financial', 'infrastructure', 'policies', 'services', 'personnel', 'legal', 'other']),
  body('status')
    .optional()
    .isIn(['draft', 'submitted', 'under-review', 'responded', 'rejected']),
  body('priority')
    .optional()
    .isIn(['normal', 'urgent']),
  body('timeframe')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  body('additionalDetails')
    .optional()
    .trim()
    .isLength({ max: 1000 }),
  body('documentTypes')
    .optional()
    .isArray(),
  body('tags')
    .optional()
    .isArray()
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

    let application = await RTIApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'RTI application not found'
      });
    }

    // Check ownership
    if (application.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update application
    application = await RTIApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'RTI application updated successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete RTI application
// @route   DELETE /api/rti/:id
// @access  Private
router.delete('/:id', checkOwnership(), async (req, res, next) => {
  try {
    const application = await RTIApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'RTI application not found'
      });
    }

    // Check ownership
    if (application.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this application'
      });
    }

    await RTIApplication.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'RTI application deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Submit RTI application
// @route   POST /api/rti/:id/submit
// @access  Private
router.post('/:id/submit', checkOwnership(), [
  body('submissionMethod')
    .isIn(['online', 'email', 'post', 'hand-delivery'])
    .withMessage('Valid submission method is required'),
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('submissionNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
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

    const { submissionMethod, trackingNumber, submissionNotes } = req.body;

    const application = await RTIApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'RTI application not found'
      });
    }

    // Check ownership
    if (application.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this application'
      });
    }

    // Mark as submitted
    await application.markAsSubmitted({
      submissionMethod,
      trackingNumber,
      submissionNotes
    });

    const updatedApplication = await RTIApplication.findById(req.params.id)
      .populate('user', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'RTI application submitted successfully',
      data: updatedApplication
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get RTI statistics for user
// @route   GET /api/rti/stats
// @access  Private
router.get('/stats', async (req, res, next) => {
  try {
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

    res.status(200).json({
      success: true,
      data: {
        total: totalApplications,
        ...statsMap
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

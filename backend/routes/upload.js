const express = require('express');
const { body, validationResult } = require('express-validator');
const { uploadDocuments, uploadImages, handleUploadError, getFileInfo } = require('../middleware/upload');
const RTIApplication = require('../models/RTIApplication');

const router = express.Router();

// @desc    Upload documents for RTI application
// @route   POST /api/upload/documents
// @access  Private
router.post('/documents', uploadDocuments, handleUploadError, [
  body('rtiId')
    .isMongoId()
    .withMessage('Valid RTI application ID is required')
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No documents uploaded'
      });
    }

    const { rtiId } = req.body;

    // Find RTI application
    const application = await RTIApplication.findById(rtiId);

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
        message: 'Not authorized to upload documents for this application'
      });
    }

    // Process uploaded files
    const uploadedFiles = req.files.map(file => getFileInfo(file));

    // Add files to application
    application.files.push(...uploadedFiles);
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: {
        uploadedFiles,
        totalFiles: application.files.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload images for RTI application
// @route   POST /api/upload/images
// @access  Private
router.post('/images', uploadImages, handleUploadError, [
  body('rtiId')
    .isMongoId()
    .withMessage('Valid RTI application ID is required')
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    const { rtiId } = req.body;

    // Find RTI application
    const application = await RTIApplication.findById(rtiId);

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
        message: 'Not authorized to upload images for this application'
      });
    }

    // Process uploaded files
    const uploadedFiles = req.files.map(file => getFileInfo(file));

    // Add files to application
    application.files.push(...uploadedFiles);
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        uploadedFiles,
        totalFiles: application.files.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete file from RTI application
// @route   DELETE /api/upload/:rtiId/file/:fileId
// @access  Private
router.delete('/:rtiId/file/:fileId', async (req, res, next) => {
  try {
    const { rtiId, fileId } = req.params;

    // Find RTI application
    const application = await RTIApplication.findById(rtiId);

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
        message: 'Not authorized to delete files from this application'
      });
    }

    // Find file in application
    const fileIndex = application.files.findIndex(file => file._id.toString() === fileId);

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Remove file from array
    const deletedFile = application.files.splice(fileIndex, 1)[0];
    await application.save();

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: {
        deletedFile,
        remainingFiles: application.files.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get files for RTI application
// @route   GET /api/upload/:rtiId/files
// @access  Private
router.get('/:rtiId/files', async (req, res, next) => {
  try {
    const { rtiId } = req.params;

    // Find RTI application
    const application = await RTIApplication.findById(rtiId).select('files user');

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
        message: 'Not authorized to view files for this application'
      });
    }

    res.status(200).json({
      success: true,
      data: application.files
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

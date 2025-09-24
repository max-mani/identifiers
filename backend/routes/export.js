const express = require('express');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const RTIApplication = require('../models/RTIApplication');
const exportService = require('../services/exportService');
const { checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Export RTI application as PDF
// @route   POST /api/export/pdf/:id
// @access  Private
router.post('/pdf/:id', checkOwnership(), [
  body('fileName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('File name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('File name can only contain letters, numbers, hyphens, and underscores'),
  body('includeHeader')
    .optional()
    .isBoolean(),
  body('includeFooter')
    .optional()
    .isBoolean(),
  body('fontSize')
    .optional()
    .matches(/^\d+px$/)
    .withMessage('Font size must be in px format (e.g., 14px)'),
  body('fontFamily')
    .optional()
    .trim()
    .isLength({ max: 100 })
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
      fileName,
      includeHeader = true,
      includeFooter = true,
      fontSize = '14px',
      fontFamily = 'Arial, sans-serif'
    } = req.body;

    // Find RTI application
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
        message: 'Not authorized to export this application'
      });
    }

    // Generate PDF
    const result = await exportService.generatePDF(application.generatedText, {
      fileName: fileName || `${application.title.replace(/[^a-zA-Z0-9]/g, '-')}-${application._id}`,
      includeHeader,
      includeFooter,
      fontSize,
      fontFamily
    });

    // Set response headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.setHeader('Content-Length', result.fileSize);

    // Send file
    res.download(result.filePath, result.fileName, (err) => {
      if (err) {
        console.error('Error sending PDF file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading PDF file'
          });
        }
      }
      
      // Clean up file after download (with delay)
      setTimeout(() => {
        exportService.deleteExportFile(result.filePath);
      }, 5000);
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Export RTI application as Word document
// @route   POST /api/export/word/:id
// @access  Private
router.post('/word/:id', checkOwnership(), [
  body('fileName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('File name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('File name can only contain letters, numbers, hyphens, and underscores'),
  body('includeHeader')
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
      fileName,
      includeHeader = true
    } = req.body;

    // Find RTI application
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
        message: 'Not authorized to export this application'
      });
    }

    // Generate Word document
    const result = await exportService.generateWord(application.generatedText, {
      fileName: fileName || `${application.title.replace(/[^a-zA-Z0-9]/g, '-')}-${application._id}`,
      includeHeader
    });

    // Set response headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.setHeader('Content-Length', result.fileSize);

    // Send file
    res.download(result.filePath, result.fileName, (err) => {
      if (err) {
        console.error('Error sending Word file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading Word file'
          });
        }
      }
      
      // Clean up file after download (with delay)
      setTimeout(() => {
        exportService.deleteExportFile(result.filePath);
      }, 5000);
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get export file info
// @route   GET /api/export/info/:fileName
// @access  Private
router.get('/info/:fileName', async (req, res, next) => {
  try {
    const { fileName } = req.params;
    
    // Check if file exists in either export directory
    const pdfPath = `./exports/pdf/${fileName}`;
    const wordPath = `./exports/word/${fileName}`;
    
    let fileInfo = exportService.getFileInfo(pdfPath);
    if (!fileInfo) {
      fileInfo = exportService.getFileInfo(wordPath);
    }
    
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'Export file not found'
      });
    }

    res.status(200).json({
      success: true,
      data: fileInfo
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Download export file
// @route   GET /api/export/download/:fileName
// @access  Private
router.get('/download/:fileName', async (req, res, next) => {
  try {
    const { fileName } = req.params;
    
    // Check if file exists in either export directory
    const pdfPath = `./exports/pdf/${fileName}`;
    const wordPath = `./exports/word/${fileName}`;
    
    let filePath = pdfPath;
    if (!fs.existsSync(pdfPath)) {
      filePath = wordPath;
      if (!fs.existsSync(wordPath)) {
        return res.status(404).json({
          success: false,
          message: 'Export file not found'
        });
      }
    }
    
    const fileInfo = exportService.getFileInfo(filePath);
    
    // Set appropriate headers
    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
    res.setHeader('Content-Length', fileInfo.fileSize);
    
    // Send file
    res.download(filePath, fileInfo.fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file'
          });
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

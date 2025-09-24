const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    './uploads/audio',
    './uploads/documents',
    './uploads/images',
    './exports/pdf',
    './exports/word'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize directories
ensureUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads/';
    
    switch (file.fieldname) {
      case 'audio':
        uploadPath += 'audio/';
        break;
      case 'document':
      case 'documents':
        uploadPath += 'documents/';
        break;
      case 'image':
      case 'images':
        uploadPath += 'images/';
        break;
      default:
        uploadPath += 'misc/';
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = {
    audio: [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      'audio/m4a',
      'audio/aac'
    ],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ],
    image: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
  };
  
  // Determine file type based on field name
  let allowedTypes = [];
  if (file.fieldname === 'audio') {
    allowedTypes = allowedMimes.audio;
  } else if (file.fieldname === 'document' || file.fieldname === 'documents') {
    allowedTypes = allowedMimes.document;
  } else if (file.fieldname === 'image' || file.fieldname === 'images') {
    allowedTypes = allowedMimes.image;
  } else {
    // Allow all types for other fields
    allowedTypes = [...allowedMimes.audio, ...allowedMimes.document, ...allowedMimes.image];
  }
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files
  },
  fileFilter: fileFilter
});

// Specific upload configurations
const uploadAudio = upload.single('audio');
const uploadDocuments = upload.array('documents', 5);
const uploadImages = upload.array('images', 5);
const uploadAny = upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
  { name: 'images', maxCount: 5 }
]);

// Middleware to handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files.'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name for file upload.'
      });
    }
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Utility function to get file info
const getFileInfo = (file) => {
  return {
    originalName: file.originalname,
    fileName: file.filename,
    filePath: file.path,
    mimeType: file.mimetype,
    size: file.size,
    uploadDate: new Date()
  };
};

module.exports = {
  upload,
  uploadAudio,
  uploadDocuments,
  uploadImages,
  uploadAny,
  handleUploadError,
  deleteFile,
  getFileInfo,
  ensureUploadDirs
};

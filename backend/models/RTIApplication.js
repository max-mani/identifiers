const mongoose = require('mongoose');

const rtiApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  originalQuery: {
    type: String,
    required: true,
    trim: true
  },
  generatedText: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'financial', 'infrastructure', 'policies', 'services', 
      'personnel', 'legal', 'other'
    ]
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under-review', 'responded', 'rejected'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
  },
  timeframe: {
    type: String,
    trim: true
  },
  additionalDetails: {
    type: String,
    trim: true
  },
  documentTypes: [{
    type: String,
    enum: [
      'files', 'correspondence', 'reports', 'contracts', 
      'bills', 'photos', 'maps', 'certificates'
    ]
  }],
  language: {
    type: String,
    default: 'english',
    enum: ['english', 'hindi', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati']
  },
  audioFile: {
    originalName: String,
    fileName: String,
    filePath: String,
    mimeType: String,
    size: Number,
    duration: Number
  },
  metadata: {
    generatedBy: {
      type: String,
      enum: ['quick-draft', 'guided-mode', 'template'],
      required: true
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
      default: null
    },
    generationTime: {
      type: Date,
      default: Date.now
    },
    aiModel: {
      type: String,
      default: 'gemini-pro'
    }
  },
  submission: {
    submittedAt: Date,
    submissionMethod: {
      type: String,
      enum: ['online', 'email', 'post', 'hand-delivery']
    },
    trackingNumber: String,
    submissionNotes: String
  },
  response: {
    receivedAt: Date,
    responseText: String,
    responseDocuments: [{
      name: String,
      filePath: String,
      mimeType: String,
      size: Number
    }],
    satisfaction: {
      type: String,
      enum: ['satisfied', 'partially-satisfied', 'not-satisfied']
    },
    appealFiled: {
      type: Boolean,
      default: false
    },
    appealDate: Date
  },
  files: [{
    name: String,
    originalName: String,
    filePath: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  lastViewed: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for status display
rtiApplicationSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'draft': 'Draft',
    'submitted': 'Submitted',
    'under-review': 'Under Review',
    'responded': 'Responded',
    'rejected': 'Rejected'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for days since creation
rtiApplicationSchema.virtual('daysSinceCreation').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days since submission
rtiApplicationSchema.virtual('daysSinceSubmission').get(function() {
  if (!this.submission?.submittedAt) return null;
  const now = new Date();
  const submitted = this.submission.submittedAt;
  const diffTime = Math.abs(now - submitted);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for better query performance
rtiApplicationSchema.index({ user: 1, createdAt: -1 });
rtiApplicationSchema.index({ status: 1 });
rtiApplicationSchema.index({ category: 1 });
rtiApplicationSchema.index({ department: 1 });
rtiApplicationSchema.index({ tags: 1 });
rtiApplicationSchema.index({ isPublic: 1 });
rtiApplicationSchema.index({ 'submission.submittedAt': -1 });

// Pre-save middleware
rtiApplicationSchema.pre('save', function(next) {
  // Auto-generate title if not provided
  if (!this.title && this.originalQuery) {
    this.title = this.originalQuery.substring(0, 100) + (this.originalQuery.length > 100 ? '...' : '');
  }
  
  // Update last viewed when status changes
  if (this.isModified('status')) {
    this.lastViewed = new Date();
  }
  
  next();
});

// Instance methods
rtiApplicationSchema.methods.incrementViews = function() {
  this.views += 1;
  this.lastViewed = new Date();
  return this.save({ validateBeforeSave: false });
};

rtiApplicationSchema.methods.markAsSubmitted = function(submissionData) {
  this.status = 'submitted';
  this.submission = {
    submittedAt: new Date(),
    ...submissionData
  };
  return this.save();
};

rtiApplicationSchema.methods.addResponse = function(responseData) {
  this.status = 'responded';
  this.response = {
    receivedAt: new Date(),
    ...responseData
  };
  return this.save();
};

// Static methods
rtiApplicationSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  return this.find(query)
    .populate('user', 'firstName lastName email')
    .populate('metadata.templateId', 'name category')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

rtiApplicationSchema.statics.getStatsByUser = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

rtiApplicationSchema.statics.findPublic = function(options = {}) {
  const query = { isPublic: true };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.department) {
    query.department = new RegExp(options.department, 'i');
  }
  
  return this.find(query)
    .populate('user', 'firstName lastName')
    .select('-generatedText -originalQuery -files -response.responseText')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

module.exports = mongoose.model('RTIApplication', rtiApplicationSchema);

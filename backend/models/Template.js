const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Template name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Template description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Infrastructure', 'Utilities', 'Education', 'Healthcare', 
      'Food Security', 'Social Welfare', 'Procurement', 'Finance', 
      'Security', 'Transport', 'Other'
    ]
  },
  icon: {
    type: String,
    default: 'FileText'
  },
  color: {
    type: String,
    default: 'bg-blue-500'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPopular: {
    type: Boolean,
    default: false
  },
  templateContent: {
    type: String,
    required: [true, 'Template content is required']
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'select', 'textarea', 'date', 'number'],
      default: 'text'
    },
    label: {
      type: String,
      required: true
    },
    placeholder: String,
    options: [String], // For select type
    required: {
      type: Boolean,
      default: false
    },
    defaultValue: String
  }],
  language: {
    type: String,
    default: 'english',
    enum: ['english', 'hindi', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati']
  },
  usage: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  preview: {
    type: String,
    maxlength: [1000, 'Preview cannot be more than 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for rating display
templateSchema.virtual('ratingDisplay').get(function() {
  if (this.rating.count === 0) return 'No ratings yet';
  return `${this.rating.average.toFixed(1)} (${this.rating.count} rating${this.rating.count !== 1 ? 's' : ''})`;
});

// Virtual for usage display
templateSchema.virtual('usageDisplay').get(function() {
  if (this.usage === 0) return 'Not used yet';
  if (this.usage === 1) return 'Used once';
  return `Used ${this.usage} times`;
});

// Indexes for better query performance
templateSchema.index({ category: 1, isActive: 1 });
templateSchema.index({ isPopular: 1, isActive: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ language: 1 });
templateSchema.index({ usage: -1 });
templateSchema.index({ 'rating.average': -1 });
templateSchema.index({ createdAt: -1 });

// Pre-save middleware
templateSchema.pre('save', function(next) {
  // Auto-generate preview if not provided
  if (!this.preview && this.description) {
    this.preview = this.description.length > 200 
      ? this.description.substring(0, 200) + '...'
      : this.description;
  }
  
  next();
});

// Instance methods
templateSchema.methods.incrementUsage = function() {
  this.usage += 1;
  return this.save({ validateBeforeSave: false });
};

templateSchema.methods.addRating = function(rating) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  const totalRating = (this.rating.average * this.rating.count) + rating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  
  return this.save();
};

templateSchema.methods.generateRTI = function(variables = {}) {
  let generatedText = this.templateContent;
  
  // Replace variables in template
  this.variables.forEach(variable => {
    const value = variables[variable.name] || variable.defaultValue || '';
    const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
    generatedText = generatedText.replace(regex, value);
  });
  
  return generatedText;
};

// Static methods
templateSchema.statics.findByCategory = function(category, options = {}) {
  const query = { category, isActive: true };
  
  if (options.language) {
    query.language = options.language;
  }
  
  return this.find(query)
    .sort(options.sort || { isPopular: -1, usage: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

templateSchema.statics.findPopular = function(options = {}) {
  const query = { isPopular: true, isActive: true };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.language) {
    query.language = options.language;
  }
  
  return this.find(query)
    .sort({ usage: -1, 'rating.average': -1 })
    .limit(options.limit || 10);
};

templateSchema.statics.search = function(searchTerm, options = {}) {
  const query = {
    isActive: true,
    $or: [
      { name: new RegExp(searchTerm, 'i') },
      { description: new RegExp(searchTerm, 'i') },
      { tags: new RegExp(searchTerm, 'i') },
      { preview: new RegExp(searchTerm, 'i') }
    ]
  };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.language) {
    query.language = options.language;
  }
  
  return this.find(query)
    .sort(options.sort || { isPopular: -1, usage: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

templateSchema.statics.getStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalUsage: { $sum: '$usage' },
        avgRating: { $avg: '$rating.average' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Template', templateSchema);

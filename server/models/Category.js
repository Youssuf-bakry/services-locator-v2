const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  displayName: {
    en: { type: String, required: true },
    ar: String
  },
  
  description: {
    en: String,
    ar: String
  },
  
  icon: {
    type: String,
    required: true
  },
  
  color: {
    type: String,
    default: '#667eea'
  },
  
  subcategories: [{
    name: { type: String, required: true },
    displayName: {
      en: String,
      ar: String
    }
  }],
  
  searchKeywords: [String],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  sortOrder: {
    type: Number,
    default: 0
  }
  
}, {
  timestamps: true
});

categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
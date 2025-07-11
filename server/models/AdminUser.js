const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  
  avatar: String,
  
  permissions: [{
    type: String,
    enum: ['manage_services', 'manage_categories', 'manage_users', 'view_analytics']
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: Date
  
}, {
  timestamps: true
});

// Hash password before saving
adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
adminUserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('AdminUser', adminUserSchema);
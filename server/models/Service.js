const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  category: {
    type: String,
    required: true,
    enum: ['pharmacy', 'restaurant', 'grocery', 'hospital', 'gas_station', 'bank', 'mall', 'other'],
    index: true
  },
  
  subcategory: {
    type: String,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // GeoJSON Point for MongoDB geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;    // latitude
        },
        message: 'Invalid coordinates format [lng, lat]'
      }
    }
  },
  
  address: {
    full: { type: String, required: true },
    street: String,
    district: String,
    city: String,
    governorate: String,
    postalCode: String,
    country: { type: String, default: 'Egypt' }
  },
  
  contact: {
    phone: String,
    mobile: String,
    whatsapp: String,
    email: {
      type: String,
      lowercase: true,
      validate: {
        validator: function(email) {
          return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Invalid email format'
      }
    },
    website: String
  },
  
  hours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  
  specialHours: [{
    date: String,
    open: String,
    close: String,
    closed: { type: Boolean, default: false },
    note: String
  }],
  
  is24Hours: {
    type: Boolean,
    default: false
  },
  
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  reviewCount: {
    type: Number,
    min: 0,
    default: 0
  },
  
  priceLevel: {
    type: Number,
    min: 1,
    max: 4,
    default: 2
  },
  
  features: [String],
  paymentMethods: [String],
  languages: [String],
  
  images: [{
    url: String,
    type: { type: String, enum: ['logo', 'storefront', 'interior', 'menu', 'other'] },
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  verified: {
    type: Boolean,
    default: false,
    index: true
  },
  
  status: {
    type: String,
    enum: ['active', 'pending', 'closed', 'suspended'],
    default: 'pending',
    index: true
  },
  
  source: {
    type: String,
    enum: ['admin_added', 'user_submitted', 'imported'],
    default: 'admin_added'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  
  lastVerifiedAt: Date

}, {
  timestamps: true
});

// Geospatial index
serviceSchema.index({ location: '2dsphere' });

// Compound indexes
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ status: 1, verified: 1 });

// Text search index
serviceSchema.index({
  name: 'text',
  description: 'text',
  'address.full': 'text'
});

// Virtual for checking if service is currently open
serviceSchema.virtual('isOpen').get(function() {
  if (this.is24Hours) return true;
  if (this.status !== 'active') return false;
  
  const now = new Date();
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.hours[currentDay];
  if (!todayHours || todayHours.closed) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
});

// Method to calculate distance from a point
serviceSchema.methods.getDistanceFrom = function(lat, lng) {
  const [serviceLng, serviceLat] = this.location.coordinates;
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = (serviceLat - lat) * Math.PI / 180;
  const dLng = (serviceLng - lng) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat * Math.PI / 180) * Math.cos(serviceLat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Transform output for API responses
serviceSchema.methods.toAPI = function() {
  const service = this.toObject();
  
  // Convert MongoDB location format to lat/lng for frontend compatibility
  service.latitude = this.location.coordinates[1];
  service.longitude = this.location.coordinates[0];
  
  // Add isOpen status
  service.isOpen = this.isOpen;
  
  // Clean up internal fields
  delete service.__v;
  delete service.createdBy;
  
  return service;
};

module.exports = mongoose.model('Service', serviceSchema);
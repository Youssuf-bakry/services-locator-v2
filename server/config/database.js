const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'city_services'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes after connection
    await createIndexes();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const Service = require('../models/Service');
    const Category = require('../models/Category');

    // Create geospatial index for location-based queries
    await Service.collection.createIndex({ location: '2dsphere' });
    
    // Create compound indexes
    await Service.collection.createIndex({ category: 1, status: 1 });
    await Service.collection.createIndex({ status: 1, verified: 1 });
    await Service.collection.createIndex({ 'address.governorate': 1, category: 1 });
    
    // Create text search index
    await Service.collection.createIndex({
      name: 'text',
      description: 'text',
      'address.full': 'text',
      'contact.phone': 'text'
    });

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.log('⚠️ Index creation warning:', error.message);
  }
};

module.exports = connectDB;
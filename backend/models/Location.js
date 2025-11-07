const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    unique: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  type: {
    type: String,
    enum: ['Residential', 'Commercial', 'Industrial', 'Public', 'Other'],
    default: 'Public'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSampleDate: {
    type: Date
  },
  averageQualityIndex: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Location', LocationSchema);


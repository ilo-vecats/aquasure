const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Water Source', 'Treatment Plant', 'Distribution Network', 'Laboratory', 'Equipment Supplier'],
    required: true
  },
  contact: {
    email: String,
    phone: String,
    address: String
  },
  certification: {
    iso9001: { type: Boolean, default: false },
    iso14001: { type: Boolean, default: false },
    other: [String]
  },
  evaluation: {
    overallRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    lastEvaluationDate: Date,
    evaluationCriteria: {
      quality: { type: Number, min: 0, max: 5 },
      delivery: { type: Number, min: 0, max: 5 },
      service: { type: Number, min: 0, max: 5 },
      price: { type: Number, min: 0, max: 5 }
    },
    status: {
      type: String,
      enum: ['Approved', 'Conditional', 'Under Review', 'Rejected'],
      default: 'Under Review'
    }
  },
  performanceHistory: [{
    period: Date,
    qualityScore: Number,
    onTimeDelivery: Number,
    complaints: Number,
    correctiveActions: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', SupplierSchema);

const mongoose = require('mongoose');

const SampleSchema = new mongoose.Schema({
  sampleId: {
    type: String,
    unique: true,
    default: () => `WS-${Date.now()}`
  },
  location: { 
    type: String, 
    required: [true, 'Location is required'],
    trim: true
  },
  locationDetails: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    type: {
      type: String,
      enum: ['source', 'treatment_plant', 'distribution', 'consumer_tap'],
      default: 'distribution'
    }
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  timeCollected: String,
  // Core Parameters (keeping existing for compatibility)
  ph: { 
    type: Number, 
    required: [true, 'pH value is required'],
    min: [0, 'pH must be between 0 and 14'],
    max: [14, 'pH must be between 0 and 14']
  },
  tds: { 
    type: Number, 
    required: [true, 'TDS value is required'],
    min: [0, 'TDS cannot be negative']
  },
  turbidity: { 
    type: Number, 
    required: [true, 'Turbidity value is required'],
    min: [0, 'Turbidity cannot be negative']
  },
  chlorine: { 
    type: Number, 
    required: [true, 'Chlorine value is required'],
    min: [0, 'Chlorine cannot be negative']
  },
  temperature: { 
    type: Number,
    min: [-10, 'Temperature seems too low'],
    max: [50, 'Temperature seems too high']
  },
  // Extended Parameters
  parameters: {
    hardness: { value: Number, unit: { type: String, default: 'mg/L as CaCO3' } },
    alkalinity: { value: Number, unit: { type: String, default: 'mg/L' } },
    iron: { value: Number, unit: { type: String, default: 'mg/L' } },
    fluoride: { value: Number, unit: { type: String, default: 'mg/L' } },
    nitrate: { value: Number, unit: { type: String, default: 'mg/L' } },
    eColi: { value: Number, unit: { type: String, default: 'CFU/100ml' } },
    totalColiform: { value: Number, unit: { type: String, default: 'CFU/100ml' } }
  },
  qualityIndex: { 
    type: Number,
    min: 0,
    max: 100
  },
  status: { 
    type: String, 
    enum: ['Safe', 'Borderline', 'Unsafe', 'pending', 'in_testing', 'approved', 'rejected', 'requires_retest'], 
    default: 'Borderline' 
  },
  compliance: {
    isCompliant: { type: Boolean, default: true },
    nonCompliantParams: [String],
    deviationSeverity: {
      type: String,
      enum: ['none', 'minor', 'major', 'critical'],
      default: 'none'
    }
  },
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  laboratory: {
    name: String,
    accreditation: String,
    testMethod: String
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  verifiedBy: {
    type: String,
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  notes: { 
    type: String,
    trim: true
  },
  correctiveActions: [{
    action: String,
    assignedTo: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  auditTrail: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }]
}, {
  timestamps: true
});

// Index for faster queries
SampleSchema.index({ timestamp: -1 });
SampleSchema.index({ location: 1 });
SampleSchema.index({ status: 1 });

module.exports = mongoose.model('Sample', SampleSchema);


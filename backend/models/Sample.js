const mongoose = require('mongoose');

const SampleSchema = new mongoose.Schema({
  location: { 
    type: String, 
    required: [true, 'Location is required'],
    trim: true
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
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
  qualityIndex: { 
    type: Number,
    min: 0,
    max: 100
  },
  status: { 
    type: String, 
    enum: ['Safe', 'Borderline', 'Unsafe'], 
    default: 'Borderline' 
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
  }]
}, {
  timestamps: true
});

// Index for faster queries
SampleSchema.index({ timestamp: -1 });
SampleSchema.index({ location: 1 });
SampleSchema.index({ status: 1 });

module.exports = mongoose.model('Sample', SampleSchema);


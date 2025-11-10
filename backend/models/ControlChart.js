const mongoose = require('mongoose');

const ControlChartSchema = new mongoose.Schema({
  chartId: {
    type: String,
    required: true,
    unique: true,
    default: () => `CHART-${Date.now()}`
  },
  type: {
    type: String,
    enum: ['X-bar R', 'X-bar S', 'p-Chart', 'c-Chart', 'u-Chart', 'Individual Moving Range'],
    required: true
  },
  parameter: {
    type: String,
    required: true // e.g., 'pH', 'TDS', 'Turbidity'
  },
  location: String,
  period: {
    startDate: Date,
    endDate: Date
  },
  data: [{
    subgroup: Number,
    values: [Number], // For X-bar R, X-bar S
    average: Number,
    range: Number,
    stdDev: Number,
    date: Date
  }],
  controlLimits: {
    centerLine: Number,
    ucl: Number, // Upper Control Limit
    lcl: Number, // Lower Control Limit
    usl: Number, // Upper Specification Limit (optional)
    lsl: Number  // Lower Specification Limit (optional)
  },
  processCapability: {
    cp: Number,
    cpk: Number,
    pp: Number,
    ppk: Number,
    mean: Number,
    stdDev: Number
  },
  violations: [{
    index: Number,
    rule: String,
    severity: {
      type: String,
      enum: ['critical', 'major', 'minor']
    },
    value: Number,
    date: Date
  }],
  status: {
    type: String,
    enum: ['In Control', 'Out of Control', 'Needs Review'],
    default: 'In Control'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ControlChart', ControlChartSchema);

const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },
  dataSource: {
    type: String,
    enum: ['location', 'global'],
    default: 'location'
  },
  predictionDate: {
    type: Date,
    required: true
  },
  predictedQualityIndex: {
    type: Number,
    min: 0,
    max: 100
  },
  predictedParameters: {
    ph: { value: Number, confidence: Number },
    tds: { value: Number, confidence: Number },
    turbidity: { value: Number, confidence: Number },
    chlorine: { value: Number, confidence: Number }
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  riskFactors: [{
    factor: String,
    impact: Number,
    description: String
  }],
  recommendedActions: [{
    action: String,
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    category: {
      type: String,
      enum: ['Preventive', 'Corrective', 'Maintenance', 'Monitoring'],
      default: 'Preventive'
    },
    estimatedCost: Number,
    estimatedImpact: Number,
    implementationTime: String,
    successProbability: Number,
    basedOn: String // Historical pattern or rule
  }],
  historicalPattern: {
    similarIssues: [{
      date: Date,
      location: String,
      issue: String,
      resolution: String,
      success: Boolean
    }],
    patternType: String,
    confidence: Number
  },
  actualOutcome: {
    actualQualityIndex: Number,
    actualParameters: {
      ph: Number,
      tds: Number,
      turbidity: Number,
      chlorine: Number
    },
    predictionAccuracy: Number,
    actionsTaken: [String],
    actionsEffective: Boolean
  },
  status: {
    type: String,
    enum: ['Active', 'Resolved', 'False Alarm', 'In Progress'],
    default: 'Active'
  },
  alertSent: {
    type: Boolean,
    default: false
  },
  alertRecipients: [String]
}, {
  timestamps: true
});

// Index for faster queries
PredictionSchema.index({ location: 1, predictionDate: 1 });
PredictionSchema.index({ riskLevel: 1, status: 1 });

module.exports = mongoose.model('Prediction', PredictionSchema);


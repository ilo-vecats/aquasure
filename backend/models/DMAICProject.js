const mongoose = require('mongoose');

const DMAICProjectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true,
    default: () => `DMAIC-${Date.now()}`
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  businessCase: String,
  currentPhase: {
    type: String,
    enum: ['Define', 'Measure', 'Analyze', 'Improve', 'Control'],
    default: 'Define'
  },
  define: {
    problemStatement: String,
    goal: String,
    scope: String,
    stakeholders: [String],
    projectCharter: String,
    startDate: Date
  },
  measure: {
    currentState: {
      baseline: Number,
      metrics: [{
        name: String,
        value: Number,
        unit: String
      }]
    },
    dataCollectionPlan: [{
      metric: String,
      method: String,
      frequency: String,
      responsible: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    measurementSystemAnalysis: String
  },
  analyze: {
    rootCauseAnalysis: {
      method: {
        type: String,
        enum: ['5 Whys', 'Fishbone', 'FMEA', 'Statistical Analysis', 'Other']
      },
      findings: [String],
      validatedRootCauses: [String]
    },
    dataAnalysis: {
      charts: [String],
      statisticalTests: [String],
      insights: String
    }
  },
  improve: {
    solutions: [{
      solution: String,
      expectedImpact: String,
      feasibility: {
        type: String,
        enum: ['High', 'Medium', 'Low']
      },
      cost: Number,
      selected: { type: Boolean, default: false }
    }],
    pilotResults: [{
      solution: String,
      results: String,
      success: Boolean
    }],
    implementationPlan: [{
      action: String,
      responsible: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      dueDate: Date,
      status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
      }
    }]
  },
  control: {
    controlPlan: [{
      metric: String,
      target: Number,
      controlMethod: String,
      frequency: String,
      responsible: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    monitoring: [{
      date: Date,
      metric: String,
      value: Number,
      inControl: Boolean
    }],
    documentation: [String],
    training: [{
      topic: String,
      audience: String,
      completed: Boolean
    }]
  },
  results: {
    before: {
      metric: String,
      value: Number
    },
    after: {
      metric: String,
      value: Number
    },
    improvement: Number, // Percentage
    targetMet: Boolean,
    financialImpact: Number
  },
  team: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Define', 'Measure', 'Analyze', 'Improve', 'Control', 'Completed', 'On Hold'],
    default: 'Define'
  },
  targetCompletionDate: Date,
  actualCompletionDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('DMAICProject', DMAICProjectSchema);


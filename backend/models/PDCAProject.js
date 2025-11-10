const mongoose = require('mongoose');

const PDCAProjectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true,
    default: () => `PDCA-${Date.now()}`
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  objective: {
    type: String,
    required: true
  },
  currentPhase: {
    type: String,
    enum: ['Plan', 'Do', 'Check', 'Act'],
    default: 'Plan'
  },
  plan: {
    problemStatement: String,
    target: String,
    analysis: String,
    actionPlan: [{
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
    }],
    startDate: Date,
    endDate: Date
  },
  do: {
    implementation: [{
      date: Date,
      action: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      results: String,
      issues: String
    }],
    dataCollected: [{
      parameter: String,
      value: Number,
      date: Date,
      notes: String
    }]
  },
  check: {
    results: [{
      metric: String,
      beforeValue: Number,
      afterValue: Number,
      improvement: Number,
      targetMet: Boolean
    }],
    analysis: String,
    charts: [String], // Chart IDs or URLs
    lessonsLearned: String
  },
  act: {
    standardization: [{
      process: String,
      document: String,
      implemented: Boolean
    }],
    nextSteps: [String],
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date
  },
  team: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Planning', 'Implementation', 'Monitoring', 'Standardization', 'Completed', 'On Hold'],
    default: 'Planning'
  },
  successCriteria: [String],
  achieved: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('PDCAProject', PDCAProjectSchema);


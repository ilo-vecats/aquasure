const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  auditId: {
    type: String,
    required: true,
    unique: true,
    default: () => `AUD-${Date.now()}`
  },
  type: {
    type: String,
    enum: ['Internal', 'External', 'Supplier', 'Process', 'System'],
    required: true
  },
  scope: {
    type: String,
    required: true
  },
  standard: {
    type: String,
    enum: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'WHO Guidelines', 'BIS Standards', 'Custom'],
    default: 'ISO 9001'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  conductedDate: Date,
  auditor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  auditTeam: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  findings: [{
    clause: String,
    description: String,
    severity: {
      type: String,
      enum: ['Critical', 'Major', 'Minor', 'Observation'],
      default: 'Minor'
    },
    evidence: String,
    rootCause: String,
    correctiveAction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CAPA'
    }
  }],
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  result: {
    type: String,
    enum: ['Pass', 'Fail', 'Conditional Pass', 'Pending'],
    default: 'Pending'
  },
  report: {
    summary: String,
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    documentUrl: String
  },
  followUpDate: Date,
  closedDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Audit', AuditSchema);

const mongoose = require('mongoose');

const CAPASchema = new mongoose.Schema({
  capaId: {
    type: String,
    required: true,
    unique: true,
    default: () => `CAPA-${Date.now()}`
  },
  type: {
    type: String,
    enum: ['Corrective Action', 'Preventive Action', 'Improvement'],
    required: true
  },
  source: {
    type: String,
    enum: ['Audit Finding', 'Non-Conformance', 'Customer Complaint', 'Internal Review', 'Management Review', 'Other'],
    required: true
  },
  sourceReference: {
    type: String // Reference to audit, NC, etc.
  },
  description: {
    type: String,
    required: true
  },
  rootCause: {
    analysis: String,
    method: {
      type: String,
      enum: ['5 Whys', 'Fishbone Diagram', 'FMEA', 'Brainstorming', 'Other']
    },
    identifiedCauses: [String]
  },
  actionPlan: [{
    action: String,
    responsible: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
      default: 'Not Started'
    },
    completionDate: Date,
    evidence: String
  }],
  effectiveness: {
    verified: { type: Boolean, default: false },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedDate: Date,
    method: String,
    result: String,
    followUpRequired: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Under Review', 'Completed', 'Closed', 'Cancelled'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  targetDate: Date,
  actualCompletionDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('CAPA', CAPASchema);


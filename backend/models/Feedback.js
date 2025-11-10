const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    organization: String,
    location: String,
    contactEmail: String,
    satisfactionScore: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Satisfaction score is required']
    },
    qualityFocus: {
      type: String,
      enum: ['Water Quality', 'Service', 'Timeliness', 'Communication', 'Other'],
      default: 'Water Quality'
    },
    feedbackType: {
      type: String,
      enum: ['Complaint', 'Compliment', 'Suggestion', 'Improvement'],
      default: 'Suggestion'
    },
    comment: {
      type: String,
      trim: true
    },
    impactAssessment: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      default: 'Low'
    },
    improvementSuggestion: String,
    relatedSupplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Closed'],
      default: 'Open'
    }
  },
  {
    timestamps: true
  }
);

FeedbackSchema.index({ satisfactionScore: -1 });
FeedbackSchema.index({ qualityFocus: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);


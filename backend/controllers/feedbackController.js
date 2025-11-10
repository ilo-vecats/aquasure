const Feedback = require('../models/Feedback');

// Submit customer feedback (TQM Unit 1: Customer focus)
exports.submitFeedback = async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all feedback entries (with optional filters)
exports.getFeedback = async (req, res) => {
  try {
    const { status, qualityFocus, feedbackType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (qualityFocus) filter.qualityFocus = qualityFocus;
    if (feedbackType) filter.feedbackType = feedbackType;

    const feedback = await Feedback.find(filter)
      .populate('relatedSupplier', 'name type evaluation.overallRating')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Feedback summary dashboard
exports.getFeedbackSummary = async (_req, res) => {
  try {
    const allFeedback = await Feedback.find();

    if (!allFeedback.length) {
      return res.json({
        totalFeedback: 0,
        averageSatisfaction: 0,
        feedbackByType: [],
        focusAreas: [],
        openIssues: 0,
        recentFeedback: []
      });
    }

    const totalFeedback = allFeedback.length;
    const averageSatisfaction =
      allFeedback.reduce((sum, item) => sum + (item.satisfactionScore || 0), 0) / totalFeedback;

    const feedbackByTypeMap = allFeedback.reduce((acc, item) => {
      const type = item.feedbackType || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const feedbackByType = Object.entries(feedbackByTypeMap).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalFeedback) * 100)
    }));

    const focusAreaMap = allFeedback.reduce((acc, item) => {
      const focus = item.qualityFocus || 'Other';
      acc[focus] = (acc[focus] || 0) + 1;
      return acc;
    }, {});

    const focusAreas = Object.entries(focusAreaMap).map(([focus, count]) => ({
      focus,
      count,
      percentage: Math.round((count / totalFeedback) * 100)
    }));

    const openIssues = allFeedback.filter(item => item.status !== 'Closed').length;

    const recentFeedback = allFeedback
      .slice(0, 5)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(item => ({
        id: item._id,
        customerName: item.customerName,
        organization: item.organization,
        satisfactionScore: item.satisfactionScore,
        feedbackType: item.feedbackType,
        qualityFocus: item.qualityFocus,
        status: item.status,
        createdAt: item.createdAt
      }));

    res.json({
      totalFeedback,
      averageSatisfaction: +averageSatisfaction.toFixed(2),
      feedbackByType,
      focusAreas,
      openIssues,
      recentFeedback
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

